import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useState } from "react";
import i18n from "../../../../locales";

interface PackageImportDialogProps {
    isOpen: boolean;
    //syncRule: SyncRule;
    //task: (syncRule: SyncRule) => void;
    //onChange(syncRule: SyncRule): void;
    onClose: (importResponse?: any) => void;
}

const PackageImportDialog: React.FC<PackageImportDialogProps> = ({
    isOpen,
    //syncRule,
    //onChange,
    onClose,
    //task,
}) => {
    const [enableImport] = useState(false);

    // useEffect(() => {
    //     syncRule.isValid().then(setEnableImport);
    // }, [syncRule]);

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            title={i18n.t("Packages Import")}
            //onSave={() => task(syncRule)}
            onCancel={onClose}
            saveText={i18n.t("Import")}
            maxWidth={"lg"}
            fullWidth={true}
            disableSave={!enableImport}
        >
            <DialogContent>
                {/* <SyncWizard
                    isDialog={true}
                    syncRule={syncRule}
                    onChange={onChange}
                    onCancel={onClose}
                /> */}
                Wizard
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default PackageImportDialog;
