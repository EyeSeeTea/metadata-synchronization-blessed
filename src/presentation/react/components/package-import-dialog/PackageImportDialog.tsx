import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog, useLoading, useSnackbar } from "d2-ui-components";
import React, { useState } from "react";
import { NamedRef } from "../../../../domain/common/entities/Ref";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { PackageImportRule } from "../../../../domain/package-import/entities/PackageImportRule";
import {
    isInstance,
    PackageSource,
} from "../../../../domain/package-import/entities/PackageSource";
import { ImportedPackage } from "../../../../domain/package-import/entities/ImportedPackage";
import { Package } from "../../../../domain/packages/entities/Package";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { useAppContext } from "../../contexts/AppContext";
import { PackageImportWizard } from "../package-import-wizard/PackageImportWizard";

interface PackageImportDialogProps {
    isOpen: boolean;
    instance: PackageSource;
    onClose: () => void;
    openSyncSummary?: (result: SyncReport) => void;
}

const PackageImportDialog: React.FC<PackageImportDialogProps> = ({
    isOpen,
    instance,
    onClose,
    openSyncSummary,
}) => {
    const [enableImport, setEnableImport] = useState(false);
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { compositionRoot, api } = useAppContext();

    const [packageImportRule, setPackageImportRule] = useState<PackageImportRule>(
        PackageImportRule.create(instance)
    );

    const handlePackageImportRuleChange = (packageImportRule: PackageImportRule) => {
        setEnableImport(packageImportRule.validate().length === 0);
        setPackageImportRule(packageImportRule);
    };

    const saveImportedPackage = async (
        pkg: Package,
        author: NamedRef,
        packageSource: PackageSource
    ) => {
        const importedPackage = mapToImportedPackage(pkg, author, packageSource);

        const result = await compositionRoot.importedPackages.save(importedPackage);

        result.match({
            success: () => {},
            error: error => {
                console.error({ error });
                snackbar.error("An error has ocurred traking the imported package");
            },
        });
    };

    const handleExecuteImport = async () => {
        // TODO: this steps coordination to import several packages, save the result
        // and save the imported package should be in the domain layer,
        // may be a new use case? ImportPackagesUseCase.execute (packageIds:string[])
        // Steps:
        // - Retrieve current user
        // - for each packageId
        //    1 - retrieve package (store or instance)
        //    2 - Import (save with the metadata reposigtory)
        //    3 - Save Result
        //    4 - Save ImportedPackage
        const report = SyncReport.create("metadata");

        const currentUser = await api.currentUser
            .get({ fields: { id: true, userCredentials: { username: true } } })
            .getData();

        const author = { id: currentUser.id, name: currentUser.userCredentials.username };

        const executePackageImport = async (packageId: string) => {
            if (isInstance(packageImportRule.source)) {
                const result = await compositionRoot.packages.get(
                    packageId,
                    packageImportRule.source
                );

                result.match({
                    success: async originPackage => {
                        try {
                            loading.show(
                                true,
                                i18n.t("Importing package {{name}}", { name: originPackage.name })
                            );
                            const result = await compositionRoot.metadata.import(
                                originPackage.contents
                            );

                            report.setStatus(
                                result.status === "ERROR" || result.status === "NETWORK ERROR"
                                    ? "FAILURE"
                                    : "DONE"
                            );

                            report.addSyncResult({
                                ...result,
                                originPackage: originPackage.toRef(),
                                origin: (packageImportRule.source as Instance).toPublicObject(),
                            });

                            if (result.status === "SUCCESS") {
                                await saveImportedPackage(
                                    originPackage,
                                    author,
                                    packageImportRule.source
                                );
                            }

                            loading.reset();
                        } catch (error) {
                            snackbar.error(error.message);
                        }
                    },
                    error: async () => {
                        loading.reset();
                        snackbar.error(i18n.t("Couldn't load package"));
                    },
                });
            } else {
                snackbar.error("Implement packages from store case");
            }
        };

        for (const id of packageImportRule.packageIds) {
            await executePackageImport(id);
        }

        await report.save(api);

        if (openSyncSummary) {
            openSyncSummary(report);
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
                />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default PackageImportDialog;

function mapToImportedPackage(
    originPackage: Package,
    author: NamedRef,
    packageSource: PackageSource
): ImportedPackage {
    return ImportedPackage.create({
        type: "INSTANCE",
        remoteId: packageSource.id,
        url: undefined,
        module: originPackage.module.name,
        packageId: originPackage.id,
        version: originPackage.version,
        name: originPackage.name,
        author,
        contents: originPackage.contents,
    });
}
