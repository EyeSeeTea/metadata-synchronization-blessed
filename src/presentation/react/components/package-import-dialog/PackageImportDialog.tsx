import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog, useLoading, useSnackbar } from "d2-ui-components";
import React, { useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { PackageImportRule } from "../../../../domain/package-import/entities/PackageImportRule";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { useAppContext } from "../../contexts/AppContext";
import { PackageImportWizard } from "../package-import-wizard/PackageImportWizard";

interface PackageImportDialogProps {
    isOpen: boolean;
    instance: Instance;
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

    const handleExecuteImport = async () => {
        const result = await compositionRoot.packages.get(
            packageImportRule.packageIds[0],
            packageImportRule.instance
        );
        result.match({
            success: async ({ name, contents }) => {
                try {
                    loading.show(true, i18n.t("Importing package {{name}}", { name }));
                    const result = await compositionRoot.metadata.import(contents);

                    const report = SyncReport.create("metadata");
                    report.setStatus(
                        result.status === "ERROR" || result.status === "NETWORK ERROR"
                            ? "FAILURE"
                            : "DONE"
                    );
                    report.addSyncResult({
                        ...result,
                        origin: packageImportRule.instance.toPublicObject(),
                    });
                    await report.save(api);

                    if (openSyncSummary) {
                        openSyncSummary(report);
                    }
                } catch (error) {
                    snackbar.error(error.message);
                }
                loading.reset();
            },
            error: async () => {
                snackbar.error(i18n.t("Couldn't load package"));
            },
        });
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
