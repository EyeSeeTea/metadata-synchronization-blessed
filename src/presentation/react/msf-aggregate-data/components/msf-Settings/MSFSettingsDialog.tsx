import { ConfirmationDialog } from "d2-ui-components";
import React from "react";
import i18n from "../../../../../locales";

export interface MSFSettingsDialogProps {
    onClose(): void;
    onSave(): void;
}

export const MSFSettingsDialog: React.FC<MSFSettingsDialogProps> = ({ onClose, onSave }) => {
    return (
        <ConfirmationDialog
            open={true}
            maxWidth="xs"
            fullWidth={true}
            title={i18n.t("MSF Settings")}
            onCancel={onClose}
            onSave={() => onSave()}
            cancelText={i18n.t("Cancel")}
            saveText={i18n.t("Save")}
        ></ConfirmationDialog>
    );
};
