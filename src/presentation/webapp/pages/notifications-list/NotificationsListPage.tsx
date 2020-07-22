import { Icon } from "@material-ui/core";
import { ObjectsTable, RowConfig, TableAction, TableColumn, useSnackbar } from "d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Notification } from "../../../../domain/notifications/entities/Notification";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import PageHeader from "../../components/page-header/PageHeader";

export const NotificationsListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const snackbar = useSnackbar();

    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const columns: TableColumn<AppNotification>[] = [
        {
            name: "sender",
            text: i18n.t("Sender"),
        },
        {
            name: "subject",
            text: i18n.t("Subject"),
        },
        {
            name: "text",
            text: i18n.t("Contents"),
            hidden: true,
        },
        {
            name: "type",
            text: i18n.t("Type"),
            getValue: ({ type }: AppNotification) => {
                switch (type) {
                    case "message":
                        return i18n.t("Message");
                    case "pull-request":
                        return i18n.t("Pull request");
                    default:
                        return i18n.t("Unknown");
                }
            },
        },
        {
            name: "status",
            text: i18n.t("Status"),
            getValue: (notification: AppNotification) => {
                if (notification.type === "pull-request") {
                    switch (notification.request.status) {
                        case "PENDING":
                            return i18n.t("Pending");
                        case "APPROVED":
                            return i18n.t("Approved");
                        case "REJECTED":
                            return i18n.t("Rejected");
                    }
                } else return "-";
            },
        },
        {
            name: "created",
            text: i18n.t("Date"),
        },
    ];

    const rowConfig = (row: AppNotification): RowConfig => {
        return { style: row.read ? { backgroundColor: "#EEEEEE" } : {} };
    };

    const actions: TableAction<AppNotification>[] = [
        {
            name: "open",
            text: i18n.t("Open"),
            primary: true,
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>open_in_new</Icon>
        },
        {
            name: "mark-as-read",
            text: i18n.t("Mark as read"),
            multiple: true,
            isActive: (rows: AppNotification[]) => rows.some(({ read }) => !read),
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>drafts</Icon>
        },
        {
            name: "mark-as-unread",
            text: i18n.t("Mark as unread"),
            multiple: true,
            isActive: (rows: AppNotification[]) => rows.some(({ read }) => !!read),
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>markunread</Icon>
        },
        {
            name: "approve-pull-request",
            text: i18n.t("Approve"),
            isActive: (rows: AppNotification[]) =>
                rows[0].type === "pull-request" && rows[0].request.status === "PENDING",
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>check</Icon>
        },
        {
            name: "reject-pull-request",
            text: i18n.t("Reject"),
            isActive: (rows: AppNotification[]) =>
                rows[0].type === "pull-request" && rows[0].request.status === "PENDING",
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>close</Icon>
        },
    ];

    useEffect(() => {
        compositionRoot.notifications
            .list()
            .then(notifications =>
                notifications.map(notification => ({
                    ...notification,
                    sender: notification.owner.name,
                }))
            )
            .then(setNotifications);
    }, [compositionRoot]);

    return (
        <React.Fragment>
            <PageHeader onBackClick={backHome} title={i18n.t("Notifications")} />

            <ObjectsTable<AppNotification>
                rows={notifications}
                columns={columns}
                actions={actions}
                rowConfig={rowConfig}
                searchBoxColumns={["sender", "subject", "text"]}
            />
        </React.Fragment>
    );
};

type AppNotification = Notification & {
    sender: string;
    [key: string]: any;
};

export default NotificationsListPage;
