import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { PackageImportRule } from "../../../../domain/package-import/entities/PackageImportRule";
import i18n from "../../../../locales";
import { PackageImportWizard } from "../package-import-wizard/PackageImportWizard";

interface PackageImportDialogProps {
    isOpen: boolean;
    packageImportRule: PackageImportRule;
    onChange: (packageImportRule: PackageImportRule) => void;
    onClose: () => void;
    executeImport: (packageImportRule: PackageImportRule) => void;
}

const PackageImportDialog: React.FC<PackageImportDialogProps> = ({
    isOpen,
    packageImportRule,
    onChange,
    onClose,
    executeImport,
}) => {
    const [enableImport, setEnableImport] = useState(false);

    useEffect(() => {
        setEnableImport(packageImportRule.validate().length === 0);
    }, [packageImportRule]);

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            title={i18n.t("Packages Import")}
            onSave={() => executeImport(packageImportRule)}
            onCancel={onClose}
            saveText={i18n.t("Import")}
            maxWidth={"lg"}
            fullWidth={true}
            disableSave={!enableImport}
        >
            <DialogContent>
                <PackageImportWizard
                    packageImportRule={packageImportRule}
                    onChange={onChange}
                    onCancel={onClose}
                    onClose={onClose}
                />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default PackageImportDialog;
