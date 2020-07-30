import { makeStyles } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import React from "react";
import { AppNotification } from "../../../../domain/notifications/entities/Notification";
import i18n from "../../../../locales";
import { DashboardModel, DataSetModel, ProgramModel } from "../../../../models/dhis/metadata";
import MetadataTable from "../metadata-table/MetadataTable";

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
            title={i18n.t("[Pull Request by {{name}}] {{subject}}", {
                subject: notification.subject,
                name: notification.owner.name,
            })}
            maxWidth={"lg"}
            fullWidth={true}
            onCancel={onClose}
            cancelText={i18n.t("Close")}
        >
            {notification.text && <p className={classes.row}>{notification.text}</p>}

            {(notification.type === "received-pull-request" ||
                notification.type === "sent-pull-request") && (
                <MetadataTable
                    models={[DataSetModel, ProgramModel, DashboardModel]}
                    filterRows={notification.selectedIds}
                    forceSelectionColumn={false}
                    showOnlySelectedFilter={false}
                />
            )}
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
});
