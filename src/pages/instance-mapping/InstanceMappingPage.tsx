import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useHistory } from "react-router-dom";
import MappingTable from "../../components/mapping-table/MappingTable";
import PageHeader from "../../components/page-header/PageHeader";

export default function InstanceMappingPage() {
    const history = useHistory();

    const backHome = () => {
        history.push("/instances/mapping");
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />

            <MappingTable />
        </React.Fragment>
    );
}
