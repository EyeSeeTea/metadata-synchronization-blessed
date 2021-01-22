import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { SynchronizationType } from "../../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../../locales";
import { HistoryTable } from "../../../../react/core/components/history-table/HistoryTable";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";

const config = {
    metadata: {
        title: i18n.t("Metadata Synchronization History"),
    },
    aggregated: {
        title: i18n.t("Aggregated Data Synchronization History"),
    },
    events: {
        title: i18n.t("Events Synchronization History"),
    },
    deleted: {
        title: i18n.t("Deleted Synchronization History"),
    },
};

export const HistoryPage: React.FC = React.memo(() => {
    const history = useHistory();
    const { id, type } = useParams() as { id: string; type: SynchronizationType };
    const { title } = config[type];

    const goBack = () => history.push("/dashboard");

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={goBack} />
            <HistoryTable types={[type]} id={id} />
        </React.Fragment>
    );
});
