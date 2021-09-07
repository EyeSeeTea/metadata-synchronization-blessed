import { makeStyles } from "@material-ui/core";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import React, { useEffect, useState } from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { AppNotification } from "../../../../../domain/notifications/entities/Notification";
import i18n from "../../../../../locales";
import { DashboardModel, DataSetModel, ProgramModel } from "../../../../../models/dhis/metadata";
import { useAppContext } from "../../contexts/AppContext";
import MetadataTable from "../metadata-table/MetadataTable";

export interface NotificationViewerDialogProps {
    notification: AppNotification;
    onClose: () => void;
}

export const NotificationViewerDialog: React.FC<NotificationViewerDialogProps> = ({ notification, onClose }) => {
    const classes = useStyles();
    const { compositionRoot } = useAppContext();

    const [remoteInstance, setRemoteInstance] = useState<Instance>();
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (notification.type === "sent-pull-request") {
            compositionRoot.instances.getById(notification.instance.id).then(result =>
                result.match({
                    success: setRemoteInstance,
                    error: () => setError(true),
                })
            );
        }
    }, [compositionRoot, notification]);

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

            {error && i18n.t("Could not connect with remote instance")}

            {!error && (notification.type === "received-pull-request" || notification.type === "sent-pull-request") && (
                <MetadataTable
                    remoteInstance={remoteInstance}
                    models={[DataSetModel, ProgramModel, DashboardModel]}
                    filterRows={notification.selectedIds}
                    forceSelectionColumn={false}
                    viewFilters={["group", "level", "orgUnit", "lastUpdated"]}
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
