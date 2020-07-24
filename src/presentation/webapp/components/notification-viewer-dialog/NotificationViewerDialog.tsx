import { makeStyles } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import React from "react";
import { AppNotification } from "../../../../domain/notifications/entities/Notification";
import i18n from "../../../../locales";

export interface NotificationViewerDialogProps {
    notification: AppNotification;
    onClose: () => void;
}

export const NotificationViewerDialog: React.FC<NotificationViewerDialogProps> = ({
    notification,
    onClose,
}) => {
    const classes = useStyles();

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Notification")}
            maxWidth={"sm"}
            fullWidth={true}
            onCancel={onClose}
            cancelText={i18n.t("Close")}
        >
            <p className={classes.row}>{notification.subject}</p>
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
});
