import i18n from "@dhis2/d2-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useState, useEffect } from "react";
import SyncRule from "../../models/syncRule";
import SyncWizard from "../sync-wizard/SyncWizard";

interface SyncDialogProps {
    title: string;
    isOpen: boolean;
    syncRule: SyncRule;
    task: (syncRule: SyncRule) => void;
    onChange(syncRule: SyncRule): void;
    onClose: (importResponse?: any) => void;
}

const SyncDialog: React.FC<SyncDialogProps> = ({
    title,
    isOpen,
    syncRule,
    onChange,
    onClose,
    task,
}) => {
    const [enableSync, updateEnableSync] = useState(false);

    useEffect(() => {
        syncRule.isValid().then(updateEnableSync);
    }, [syncRule]);

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            title={title}
            onSave={() => task(syncRule)}
            onCancel={onClose}
            saveText={i18n.t("Synchronize")}
            maxWidth={"lg"}
            fullWidth={true}
            disableSave={!enableSync}
        >
            <DialogContent>
                <SyncWizard
                    isDialog={true}
                    syncRule={syncRule}
                    onChange={onChange}
                    onCancel={onClose}
                />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default SyncDialog;
