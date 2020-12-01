import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog, useLoading, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Either } from "../../../../domain/common/entities/Either";
import { NamedRef } from "../../../../domain/common/entities/Ref";
import { JSONDataSource } from "../../../../domain/instance/entities/JSONDataSource";
import { PackageImportRule } from "../../../../domain/package-import/entities/PackageImportRule";
import {
    isInstance,
    isStore,
    PackageSource,
} from "../../../../domain/package-import/entities/PackageSource";
import { mapToImportedPackage } from "../../../../domain/package-import/mappers/ImportedPackageMapper";
import { Package } from "../../../../domain/packages/entities/Package";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { useAppContext } from "../../contexts/AppContext";
import { PackageImportWizard } from "../package-import-wizard/PackageImportWizard";

interface PackageImportDialogProps {
    isOpen: boolean;
    instance: PackageSource;
    selectedPackagesId?: string[];
    onClose: () => void;
    openSyncSummary?: (result: SyncReport) => void;
    disablePackageSelection?: boolean;
}

const PackageImportDialog: React.FC<PackageImportDialogProps> = ({
    isOpen,
    instance,
    selectedPackagesId,
    onClose,
    openSyncSummary,
    disablePackageSelection,
}) => {
    const [enableImport, setEnableImport] = useState(false);
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { compositionRoot, api } = useAppContext();

    const [packageImportRule, setPackageImportRule] = useState<PackageImportRule>(
        PackageImportRule.create(instance, selectedPackagesId)
    );

    useEffect(() => {
        const rule = PackageImportRule.create(instance, selectedPackagesId);
        setPackageImportRule(rule);
        setEnableImport(rule.validate().length === 0);
    }, [instance, selectedPackagesId]);

    const handlePackageImportRuleChange = (packageImportRule: PackageImportRule) => {
        setEnableImport(packageImportRule.validate().length === 0);
        setPackageImportRule(packageImportRule);
    };

    const saveImportedPackages = async (
        packages: Package[],
        author: NamedRef,
        packageSource: PackageSource,
        storePackageUrls: Record<string, string>
    ) => {
        const importedPackages = packages.map(pkg =>
            mapToImportedPackage(pkg, author, packageSource, storePackageUrls[pkg.id])
        );

        const result = await compositionRoot.importedPackages.save(importedPackages);

        result.match({
            success: () => {},
            error: () => {
                snackbar.error("An error has ocurred tracking the imported packages");
            },
        });
    };

    const getPackage = (packageId: string): Promise<Either<"NOT_FOUND", Package>> => {
        if (isInstance(packageImportRule.source)) {
            return compositionRoot.packages.get(packageId, packageImportRule.source);
        } else {
            return compositionRoot.packages.getStore(packageImportRule.source.id, packageId);
        }
    };

    const handleExecuteImport = async () => {
        // TODO: this steps coordination to import several packages, save the result
        // and save the imported package should be in the domain layer,
        // may be a new use case? ImportPackagesUseCase.execute (packageIds:string[])
        // Steps:
        // - Retrieve current user
        // - for each packageId
        //    1 - retrieve package (store or instance) (using PackageRepository)
        //    2 - Import (using MetadataRepository)
        //    3 - Save Result (using ResultRepository)
        //    4 - Save ImportedPackage (using ImportedPackageRepository)
        const importedPackages: Package[] = [];

        const currentUser = await api.currentUser
            .get({ fields: { id: true, userCredentials: { username: true } } })
            .getData();

        const report = SyncReport.create(
            "metadata",
            currentUser.userCredentials.username ?? "Unknown",
            true
        );

        const storePackageUrls: Record<string, string> = {};

        try {
            const author = { id: currentUser.id, name: currentUser.userCredentials.username };

            const executePackageImport = async (packageId: string) => {
                const getPackageResult = await getPackage(packageId);

                await getPackageResult.match({
                    success: async originPackage => {
                        loading.show(
                            true,
                            i18n.t("Importing package {{name}}", { name: originPackage.name })
                        );

                        if (isStore(packageImportRule.source)) {
                            storePackageUrls[originPackage.id] = packageId;
                        }

                        const temporalPackageMapping = packageImportRule.temporalPackageMappings.find(
                            mappingTemp => mappingTemp.owner.id === packageId
                        );

                        const mapping = temporalPackageMapping
                            ? temporalPackageMapping
                            : await compositionRoot.mapping.get({
                                  type: isInstance(packageImportRule.source) ? "instance" : "store",
                                  id: packageImportRule.source.id,
                                  moduleId: originPackage.module.id,
                              });

                        const originInstance = isInstance(packageImportRule.source)
                            ? await compositionRoot.instances.getById(packageImportRule.source.id)
                            : undefined;

                        const originDataSource =
                            originInstance?.value.data ??
                            JSONDataSource.build(originPackage.dhisVersion, originPackage.contents);

                        const result = await compositionRoot.packages.import(
                            originPackage,
                            mapping?.mappingDictionary,
                            originDataSource
                        );

                        report.setTypes(
                            _.uniq([...report.syncReport.types, ..._.keys(originPackage.contents)])
                        );

                        report.setStatus(
                            result.status === "ERROR" || result.status === "NETWORK ERROR"
                                ? "FAILURE"
                                : "DONE"
                        );

                        const origin = isInstance(packageImportRule.source)
                            ? packageImportRule.source.toPublicObject()
                            : packageImportRule.source;

                        report.addSyncResult({
                            ...result,
                            originPackage: originPackage.toRef(),
                            origin: origin,
                        });

                        if (result.status === "SUCCESS") {
                            importedPackages.push(originPackage);
                        }
                    },
                    error: async () => {
                        loading.reset();
                        snackbar.error(i18n.t("Couldn't load package"));
                    },
                });
            };

            for (const id of packageImportRule.packageIds) {
                await executePackageImport(id);
            }

            loading.show(true, i18n.t("Saving imported packages"));

            await report.save(api);

            await saveImportedPackages(
                importedPackages,
                author,
                packageImportRule.source,
                storePackageUrls
            );

            loading.reset();

            if (openSyncSummary) {
                openSyncSummary(report);
            }
        } catch (error) {
            loading.reset();
            snackbar.error(i18n.t("An error has ocurred importing packages"));
        }
    };

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            title={i18n.t("Packages Import")}
            onSave={() => handleExecuteImport()}
            onCancel={onClose}
            saveText={i18n.t("Import")}
            maxWidth={"lg"}
            fullWidth={true}
            disableSave={!enableImport}
        >
            <DialogContent>
                <PackageImportWizard
                    packageImportRule={packageImportRule}
                    onChange={handlePackageImportRuleChange}
                    onCancel={onClose}
                    onClose={onClose}
                    disablePackageSelection={disablePackageSelection}
                />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default PackageImportDialog;
