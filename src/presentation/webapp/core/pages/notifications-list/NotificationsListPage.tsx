import { Checkbox, FormControlLabel, Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import {
    ObjectsTable,
    RowConfig,
    TableAction,
    TableColumn,
    TableGlobalAction,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Either } from "../../../../../domain/common/entities/Either";
import { AppNotification } from "../../../../../domain/notifications/entities/Notification";
import { CancelPullRequestError } from "../../../../../domain/notifications/usecases/CancelPullRequestUseCase";
import { ImportPullRequestError } from "../../../../../domain/notifications/usecases/ImportPullRequestUseCase";
import { UpdatePullRequestStatusError } from "../../../../../domain/notifications/usecases/UpdatePullRequestStatusUseCase";
import { SynchronizationReport } from "../../../../../domain/reports/entities/SynchronizationReport";
import { SynchronizationResult } from "../../../../../domain/reports/entities/SynchronizationResult";
import i18n from "../../../../../locales";
import Dropdown from "../../../../react/core/components/dropdown/Dropdown";
import { NotificationViewerDialog } from "../../../../react/core/components/notification-viewer-dialog/NotificationViewerDialog";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import SyncSummary from "../../../../react/core/components/sync-summary/SyncSummary";
import { useAppContext } from "../../../../react/core/contexts/AppContext";

export const NotificationsListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const classes = useStyles();
    const { id } = useParams<{ id?: string }>();

    const [notifications, setNotifications] = useState<TableNotification[]>([]);
    const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [resetKey, setResetKey] = useState(Math.random());
    const [detailsNotification, setDetailsNotification] = useState<AppNotification>();
    const [syncReport, setSyncReport] = useState<SynchronizationReport>();

    const backHome = useCallback(() => {
        history.push("/dashboard");
    }, [history]);

    const changeUnreadCheckbox = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setUnreadOnly(event.target?.checked);
    }, []);

    const columns: TableColumn<TableNotification>[] = [
        {
            name: "instance",
            text: i18n.t("Origin Instance"),
            getValue: ({ instance }) => {
                return instance.url;
            },
        },
        {
            name: "sender",
            text: i18n.t("Requestor"),
        },
        {
            name: "recipients",
            text: i18n.t("Custodian"),
            getValue: ({ users = [], userGroups = [] }) => {
                return [...users, ...userGroups].map(({ name }) => name).join(", ");
            },
        },
        {
            name: "subject",
            text: i18n.t("Subject"),
        },
        {
            name: "text",
            text: i18n.t("Description"),
            hidden: true,
        },
        {
            name: "type",
            text: i18n.t("Type"),
            getValue: ({ type }) => {
                switch (type) {
                    case "message":
                        return i18n.t("Message");
                    case "sent-pull-request":
                        return i18n.t("Pull request (Sent)");
                    case "received-pull-request":
                        return i18n.t("Pull request (Received)");
                    default:
                        return i18n.t("Unknown");
                }
            },
        },
        {
            name: "status",
            text: i18n.t("Status"),
            getValue: notification => {
                if (notification.type === "sent-pull-request" || notification.type === "received-pull-request") {
                    const status = notificationStatuses.find(({ id }) => id === notification.status);

                    const showWarning = notification.type === "sent-pull-request" && notification.status === "APPROVED";

                    return (
                        <span>
                            <Typography variant={"inherit"} gutterBottom>
                                {status?.name ?? "Unknown"}
                            </Typography>
                            {showWarning && (
                                <Tooltip title={i18n.t("Pull request approved but not imported")} placement="top">
                                    <IconButton className={classes.iconButton}>
                                        <Icon color="error">warning</Icon>
                                    </IconButton>
                                </Tooltip>
                            )}
                        </span>
                    );
                } else {
                    return "-";
                }
            },
        },
        {
            name: "created",
            text: i18n.t("Date"),
        },
    ];

    const rowConfig = (row: TableNotification): RowConfig => {
        return { cellStyle: row.read ? { backgroundColor: "#EEEEEE" } : { fontWeight: "bold" } };
    };

    const validateImportPullRequestAction = useCallback(
        async (result: Either<ImportPullRequestError, SynchronizationResult>) => {
            await result.match({
                success: async result => {
                    const report = SynchronizationReport.create("metadata");
                    report.setStatus(
                        result.status === "ERROR" || result.status === "NETWORK ERROR" ? "FAILURE" : "DONE"
                    );
                    report.addSyncResult(result);
                    await compositionRoot.reports.save(report);

                    setSyncReport(report);
                },
                error: async code => {
                    switch (code) {
                        case "ALREADY_IMPORTED":
                            snackbar.error(i18n.t("Package has been already imported"));
                            return;
                        case "INSTANCE_NOT_FOUND":
                            snackbar.error(i18n.t("Instance not found"));
                            return;
                        case "INVALID_NOTIFICATION":
                            snackbar.error(i18n.t("Notification is invalid"));
                            return;
                        case "NOTIFICATION_NOT_FOUND":
                            snackbar.error(i18n.t("Notification not found"));
                            return;
                        case "NOT_APPROVED":
                            snackbar.error(i18n.t("Remote pull request has not been approved yet"));
                            return;
                        case "REMOTE_INVALID_NOTIFICATION":
                            snackbar.error(i18n.t("Remote pull request is not valid"));
                            return;
                        case "REMOTE_NOTIFICATION_NOT_FOUND":
                            snackbar.error(i18n.t("Remote pull request has been deleted"));
                            return;
                        default:
                            snackbar.error(i18n.t("Unknown error"));
                            return;
                    }
                },
            });
        },
        [snackbar, compositionRoot]
    );

    const validateUpdateStatusAction = useCallback(
        (result: Either<UpdatePullRequestStatusError, void>) => {
            result.match({
                success: () => snackbar.success(i18n.t("Updated notification")),
                error: code => {
                    switch (code) {
                        case "NOT_FOUND":
                            snackbar.error(i18n.t("Could not apply action, notification not found"));
                            return;
                        case "PERMISSIONS":
                            snackbar.error(i18n.t("You don't have permissions to edit this notification"));
                            return;
                        case "INVALID":
                            snackbar.error(i18n.t("Could not apply action, notification is not valid"));
                            return;
                        default:
                            snackbar.error(i18n.t("Unknown error"));
                    }
                },
            });
        },
        [snackbar]
    );

    const validateCancelPullRequestAction = useCallback(
        (result: Either<CancelPullRequestError, void>) => {
            result.match({
                success: () => snackbar.success(i18n.t("Updated notification")),
                error: code => {
                    switch (code) {
                        case "INSTANCE_NOT_FOUND":
                            snackbar.error(i18n.t("Instance not found"));
                            return;
                        case "NOT_FOUND":
                            snackbar.error(i18n.t("Could not apply action, notification not found"));
                            return;
                        case "REMOTE_NOT_FOUND":
                            snackbar.warning(i18n.t("Could not update remote instance, notification not found"));
                            return;
                        case "INVALID":
                        case "REMOTE_INVALID":
                            snackbar.error(i18n.t("Could not apply action, notification is not valid"));
                            return;
                        default:
                            snackbar.error(i18n.t("Unknown error"));
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
                    await compositionRoot.notifications.markReadNotifications(rows, true);
                    setResetKey(Math.random());

                    const notification = notifications.find(({ id }) => id === rows[0]);
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
                    rows[0].type === "received-pull-request" && rows[0].status === "PENDING",
                onClick: async rows => {
                    const result = await compositionRoot.notifications.updatePullRequestStatus(rows[0], "APPROVED");

                    validateUpdateStatusAction(result);
                    setResetKey(Math.random());
                },
                icon: <Icon>check</Icon>,
            },
            {
                name: "reject-pull-request",
                text: i18n.t("Reject"),
                isActive: (rows: AppNotification[]) =>
                    rows[0].type === "received-pull-request" && rows[0].status === "PENDING",
                onClick: async rows => {
                    const result = await compositionRoot.notifications.updatePullRequestStatus(rows[0], "REJECTED");

                    validateUpdateStatusAction(result);
                    setResetKey(Math.random());
                },
                icon: <Icon>close</Icon>,
            },
            {
                name: "import-pull-request",
                text: i18n.t("Import"),
                isActive: (rows: AppNotification[]) =>
                    rows[0].type === "sent-pull-request" &&
                    (rows[0].status === "APPROVED" || rows[0].status === "IMPORTED_WITH_ERRORS"),
                onClick: async rows => {
                    loading.show(true, i18n.t("Importing approved pull request"));
                    const result = await compositionRoot.notifications.importPullRequest(rows[0]);

                    await validateImportPullRequestAction(result);
                    setResetKey(Math.random());
                    loading.reset();
                },
                icon: <Icon>arrow_downward</Icon>,
            },
            {
                name: "cancel-pull-request",
                text: i18n.t("Cancel"),
                isActive: (rows: AppNotification[]) =>
                    rows[0].type === "sent-pull-request" &&
                    (rows[0].status === "PENDING" ||
                        rows[0].status === "APPROVED" ||
                        rows[0].status === "IMPORTED_WITH_ERRORS"),
                onClick: async rows => {
                    loading.show(true, i18n.t("Cancelling pull request"));
                    const result = await compositionRoot.notifications.cancelPullRequest(rows[0]);

                    validateCancelPullRequestAction(result);
                    setResetKey(Math.random());
                    loading.reset();
                },
                icon: <Icon>cancel</Icon>,
            },
        ],
        [
            compositionRoot,
            notifications,
            loading,
            validateUpdateStatusAction,
            validateImportPullRequestAction,
            validateCancelPullRequestAction,
        ]
    );

    const notificationStatuses = useMemo(
        () => [
            { id: "PENDING", name: i18n.t("Pending") },
            { id: "APPROVED", name: i18n.t("Approved") },
            { id: "REJECTED", name: i18n.t("Rejected") },
            { id: "IMPORTED", name: i18n.t("Imported") },
            { id: "IMPORTED_WITH_ERRORS", name: i18n.t("Imported with errors") },
            { id: "CANCELLED", name: i18n.t("Cancelled") },
        ],
        []
    );

    const filterComponents = useMemo(
        () => (
            <React.Fragment key={"table-filters"}>
                <Dropdown
                    items={notificationStatuses}
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
        [classes, statusFilter, unreadOnly, changeUnreadCheckbox, notificationStatuses]
    );

    const globalActions: TableGlobalAction[] = useMemo(
        () => [
            {
                name: "refresh",
                text: i18n.t("Refresh"),
                icon: <Icon>refresh</Icon>,
                onClick: () => setResetKey(Math.random()),
            },
        ],
        []
    );

    const rows = notifications
        .filter(notification => !unreadOnly || !notification.read)
        .filter(
            notification =>
                !statusFilter ||
                ((notification.type === "sent-pull-request" || notification.type === "received-pull-request") &&
                    notification.status === statusFilter)
        );

    useEffect(() => {
        loading.show();
        compositionRoot.notifications
            .list()
            .then(notifications => {
                const appNotifications = notifications.map(notification => ({
                    ...notification,
                    sender: notification.owner.name,
                }));

                setNotifications(appNotifications);
            })
            .catch(err => {
                snackbar.error(err.message);
            })
            .finally(() => {
                loading.reset();
            });
    }, [compositionRoot, loading, snackbar, resetKey]);

    useEffect(() => {
        if (!id || notifications.length === 0) return;

        const notification = notifications.find(row => row.id === id);
        if (notification) setDetailsNotification(notification);
    }, [id, notifications]);

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
                globalActions={globalActions}
                initialState={{ sorting: { field: "created", order: "desc" } }}
            />

            {detailsNotification && (
                <NotificationViewerDialog
                    notification={detailsNotification}
                    onClose={() => setDetailsNotification(undefined)}
                />
            )}

            {!!syncReport && <SyncSummary report={syncReport} onClose={() => setSyncReport(undefined)} />}
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    checkbox: {
        paddingLeft: 10,
        marginTop: 8,
    },
    iconButton: {
        padding: 0,
        paddingLeft: 8,
        paddingRight: 8,
    },
});

type TableNotification = AppNotification & {
    sender: string;
    [key: string]: unknown;
};

export default NotificationsListPage;
