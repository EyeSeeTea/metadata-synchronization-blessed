import { Checkbox, FormControlLabel, Icon, makeStyles } from "@material-ui/core";
import { ObjectsTable, RowConfig, TableAction, TableColumn, useSnackbar } from "d2-ui-components";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { Notification } from "../../../../domain/notifications/entities/Notification";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";

export const NotificationsListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const snackbar = useSnackbar();
    const classes = useStyles();

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const changeUnreadCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUnreadOnly(event.target?.checked);
    };

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
            getValue: ({ type }) => {
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
            getValue: notification => {
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
            icon: <Icon>open_in_new</Icon>,
        },
        {
            name: "mark-as-read",
            text: i18n.t("Mark as read"),
            multiple: true,
            isActive: (rows: AppNotification[]) => rows.some(({ read }) => !read),
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>drafts</Icon>,
        },
        {
            name: "mark-as-unread",
            text: i18n.t("Mark as unread"),
            multiple: true,
            isActive: (rows: AppNotification[]) => rows.some(({ read }) => !!read),
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>markunread</Icon>,
        },
        {
            name: "approve-pull-request",
            text: i18n.t("Approve"),
            isActive: (rows: AppNotification[]) =>
                rows[0].type === "pull-request" && rows[0].request.status === "PENDING",
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>check</Icon>,
        },
        {
            name: "reject-pull-request",
            text: i18n.t("Reject"),
            isActive: (rows: AppNotification[]) =>
                rows[0].type === "pull-request" && rows[0].request.status === "PENDING",
            onClick: () => snackbar.warning("Not implemented"),
            icon: <Icon>close</Icon>,
        },
    ];

    const filterComponents = useMemo(
        () => (
            <React.Fragment key={"table-filters"}>
                <Dropdown
                    items={[
                        { id: "PENDING", name: i18n.t("Pending") },
                        { id: "APPROVED", name: i18n.t("Approved") },
                        { id: "REJECTED", name: i18n.t("Rejected") },
                    ]}
                    onValueChange={setStatusFilter}
                    value={statusFilter}
                    label={i18n.t("Status")}
                />
                <FormControlLabel
                    className={classes.checkbox}
                    control={<Checkbox checked={unreadOnly} onChange={changeUnreadCheckbox} />}
                    label={i18n.t("Unread messages")}
                />
            </React.Fragment>
        ),
        [classes, statusFilter, unreadOnly]
    );

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

    const rows = notifications
        .filter(notification => !unreadOnly || !notification.read)
        .filter(
            notification =>
                !statusFilter ||
                (notification.type === "pull-request" &&
                    notification.request.status === statusFilter)
        );

    return (
        <React.Fragment>
            <PageHeader onBackClick={backHome} title={i18n.t("Notifications")} />

            <ObjectsTable<AppNotification>
                rows={rows}
                columns={columns}
                actions={actions}
                rowConfig={rowConfig}
                searchBoxColumns={["sender", "subject", "text"]}
                filterComponents={filterComponents}
            />
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    checkbox: {
        paddingLeft: 10,
        marginTop: 8,
    },
});

type AppNotification = Notification & {
    sender: string;
    [key: string]: any;
};

export default NotificationsListPage;
