import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import React, { useEffect, useState } from "react";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../../locales";
import SyncWizard from "../sync-wizard/SyncWizard";

interface SyncDialogProps {
    title: string;
    isOpen: boolean;
    syncRule: SynchronizationRule;
    task: (syncRule: SynchronizationRule) => void;
    onChange(syncRule: SynchronizationRule): void;
    onClose: (importResponse?: any) => void;
}

const SyncDialog: React.FC<SyncDialogProps> = ({ title, isOpen, syncRule, onChange, onClose, task }) => {
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
                <SyncWizard isDialog={true} syncRule={syncRule} onChange={onChange} onCancel={onClose} />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default SyncDialog;
