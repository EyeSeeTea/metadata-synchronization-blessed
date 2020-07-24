import { Checkbox, FormControlLabel, Icon, makeStyles } from "@material-ui/core";
import { ObjectsTable, RowConfig, TableAction, TableColumn, useSnackbar } from "d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Either } from "../../../../domain/common/entities/Either";
import { AppNotification } from "../../../../domain/notifications/entities/Notification";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import Dropdown from "../../components/dropdown/Dropdown";
import { NotificationViewerDialog } from "../../components/notification-viewer-dialog/NotificationViewerDialog";
import PageHeader from "../../components/page-header/PageHeader";

export const NotificationsListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const snackbar = useSnackbar();
    const classes = useStyles();

    const [notifications, setNotifications] = useState<TableNotification[]>([]);
    const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [resetKey, setResetKey] = useState(Math.random());
    const [detailsNotification, setDetailsNotification] = useState<AppNotification>();

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const changeUnreadCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUnreadOnly(event.target?.checked);
    };

    const columns: TableColumn<TableNotification>[] = [
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

    const rowConfig = (row: TableNotification): RowConfig => {
        return { style: row.read ? { backgroundColor: "#EEEEEE" } : {} };
    };

    const validateAction = useCallback(
        (result: Either<"NOT_FOUND" | "PERMISSIONS", void>) => {
            result.match({
                success: () => snackbar.success(i18n.t("Updated notification")),
                error: code => {
                    switch (code) {
                        case "NOT_FOUND":
                            snackbar.error(
                                i18n.t("Could not apply action, notification not found")
                            );
                            return;
                        case "PERMISSIONS":
                            snackbar.error(
                                i18n.t("You don't have permissions to edit this notification")
                            );
                    }
                },
            });
        },
        [snackbar]
    );

    const actions: TableAction<TableNotification>[] = useMemo(
        () => [
            {
                name: "open",
                text: i18n.t("Open"),
                primary: true,
                onClick: async rows => {
                    const notification = notifications.find(({id}) => id  === rows[0]);
                    setDetailsNotification(notification);
                },
                icon: <Icon>open_in_new</Icon>,
            },
            {
                name: "mark-as-read",
                text: i18n.t("Mark as read"),
                multiple: true,
                isActive: (rows: AppNotification[]) => rows.some(({ read }) => !read),
                onClick: async rows => {
                    await compositionRoot.notifications.markReadNotifications(rows, true);

                    setResetKey(Math.random());
                },
                icon: <Icon>drafts</Icon>,
            },
            {
                name: "mark-as-unread",
                text: i18n.t("Mark as unread"),
                multiple: true,
                isActive: (rows: AppNotification[]) => rows.some(({ read }) => !!read),
                onClick: async rows => {
                    await compositionRoot.notifications.markReadNotifications(rows, false);

                    setResetKey(Math.random());
                },
                icon: <Icon>markunread</Icon>,
            },
            {
                name: "approve-pull-request",
                text: i18n.t("Approve"),
                isActive: (rows: AppNotification[]) =>
                    rows[0].type === "pull-request" && rows[0].request.status === "PENDING",
                onClick: async rows => {
                    const result = await compositionRoot.notifications.updatePullRequestStatus(
                        rows[0],
                        "APPROVED"
                    );

                    validateAction(result);
                    setResetKey(Math.random());
                },
                icon: <Icon>check</Icon>,
            },
            {
                name: "reject-pull-request",
                text: i18n.t("Reject"),
                isActive: (rows: AppNotification[]) =>
                    rows[0].type === "pull-request" && rows[0].request.status === "PENDING",
                onClick: async rows => {
                    const result = await compositionRoot.notifications.updatePullRequestStatus(
                        rows[0],
                        "REJECTED"
                    );

                    validateAction(result);
                    setResetKey(Math.random());
                },
                icon: <Icon>close</Icon>,
            },
        ],
        [compositionRoot, validateAction, notifications]
    );

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
    }, [compositionRoot, resetKey]);

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

            <ObjectsTable<TableNotification>
                rows={rows}
                columns={columns}
                actions={actions}
                rowConfig={rowConfig}
                searchBoxColumns={["sender", "subject", "text"]}
                filterComponents={filterComponents}
                initialState={{ sorting: { field: "created", order: "desc" } }}
            />

            {detailsNotification && (
                <NotificationViewerDialog
                    notification={detailsNotification}
                    onClose={() => setDetailsNotification(undefined)}
                />
            )}
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    checkbox: {
        paddingLeft: 10,
        marginTop: 8,
    },
});

type TableNotification = AppNotification & {
    sender: string;
    [key: string]: any;
};

export default NotificationsListPage;
