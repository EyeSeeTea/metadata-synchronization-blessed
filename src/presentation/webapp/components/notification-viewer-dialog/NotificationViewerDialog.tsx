import { makeStyles } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import React from "react";
import { AppNotification } from "../../../../domain/notifications/entities/Notification";
import i18n from "../../../../locales";
import MetadataTable from "../metadata-table/MetadataTable";
import { DataSetModel, ProgramModel } from "../../../../models/dhis/metadata";

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
            title={i18n.t("{{subject}} by {{name}}", {
                subject: notification.subject,
                name: notification.owner.name,
            })}
            maxWidth={"lg"}
            fullWidth={true}
            onCancel={onClose}
            cancelText={i18n.t("Close")}
        >
            {notification.text && <p className={classes.row}>{notification.text}</p>}

            {notification.type === "pull-request" && (
                <MetadataTable
                    models={[DataSetModel, ProgramModel]}
                    filterRows={notification.request.selectedIds}
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
