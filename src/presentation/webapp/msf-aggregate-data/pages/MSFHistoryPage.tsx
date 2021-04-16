import React from "react";
import { useHistory } from "react-router-dom";
import i18n from "../../../../locales";
import { HistoryTable } from "../../../react/core/components/history-table/HistoryTable";
import PageHeader from "../../../react/core/components/page-header/PageHeader";

export const MSFHistoryPage: React.FC = React.memo(() => {
    const history = useHistory();

    const goBack = () => history.push("/msf");

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Synchronization History")} onBackClick={goBack} />
            <HistoryTable types={["aggregated", "events"]} />
        </React.Fragment>
    );
});
