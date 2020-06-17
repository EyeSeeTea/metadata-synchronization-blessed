import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useHistory } from "react-router-dom";
import { ModulesListTable } from "../../../common/components/modules-list-table/ModulesListTable";
import PageHeader from "../../components/page-header/PageHeader";

const ModulesListPage: React.FC = () => {
    const history = useHistory();

    const backHome = () => {
        history.push("/");
    };

    const createModule = () => {
        history.push(`/modules/new`);
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Modules")} onBackClick={backHome} />

            <ModulesListTable onActionButtonClick={createModule} />
        </React.Fragment>
    );
};

export default ModulesListPage;
