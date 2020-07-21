import { ObjectsTable, TableColumn } from "d2-ui-components";
import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Notification } from "../../../../domain/notifications/entities/Notification";
import { PullRequestNotification } from "../../../../domain/notifications/entities/PullRequestNotification";
import i18n from "../../../../locales";
import PageHeader from "../../components/page-header/PageHeader";

const notifications: PullRequestNotification[] = [
    {
        id: "1",
        type: "pull-request",
        read: false,
        owner: { id: "foo", name: "Alexis Rico" },
        created: new Date(),
        subject: "Foo",
        text: "Bar",
        users: [{ id: "foo" }],
        request: { type: "metadata", status: "REJECTED", selectedIds: ["foo"] },
    },
    {
        id: "2",
        type: "pull-request",
        read: false,
        owner: { id: "foo", name: "Alexis Rico" },
        created: new Date(),
        subject: "Foo",
        text: "Bar",
        users: [{ id: "foo" }],
        request: { type: "metadata", status: "PENDING", selectedIds: ["foo"] },
    },
];

export const NotificationsListPage: React.FC = () => {
    const history = useHistory();

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const columns: TableColumn<AppNotification>[] = [
        {
            name: "subject",
            text: i18n.t("Subject"),
        },
    ];

    return (
        <React.Fragment>
            <PageHeader onBackClick={backHome} title={i18n.t("Notifications")} />

            <ObjectsTable<AppNotification> rows={notifications} columns={columns} />
        </React.Fragment>
    );
};

type AppNotification = Notification | PullRequestNotification;

export default NotificationsListPage;
