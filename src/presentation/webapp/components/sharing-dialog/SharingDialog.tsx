import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog, Sharing, SharingProps } from "d2-ui-components";
import React from "react";
import i18n from "../../../../locales";

export interface SharingDialogProps extends SharingProps {
    isOpen: boolean;
    onCancel: () => void;
}

export const SharingDialog: React.FC<SharingDialogProps> = ({ isOpen, onCancel, ...rest }) => {
    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={isOpen}
                title={i18n.t("Sharing settings")}
                onCancel={onCancel}
                cancelText={i18n.t("Close")}
                maxWidth={"lg"}
                fullWidth={true}
                disableEnforceFocus
            >
                <DialogContent>
                    <Sharing {...rest} />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};
