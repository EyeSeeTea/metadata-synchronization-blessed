import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, ObjectsTableDetailField, TableAction, TableColumn } from "d2-ui-components";
import React from "react";
import { useHistory } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import { Module } from "../../../../domain/modules/entities/Module";

const ModulesListPage: React.FC = () => {
    const history = useHistory();

    const columns: TableColumn<Module>[] = [{ name: "name", text: i18n.t("Name"), sortable: true }];

    const details: ObjectsTableDetailField<Module>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
    ];

    const backHome = () => {
        history.push("/");
    };

    const actions: TableAction<Module>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
    ];

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Modules")} onBackClick={backHome} />

            <ObjectsTable<Module> rows={[]} columns={columns} details={details} actions={actions} />
        </React.Fragment>
    );
};

export default ModulesListPage;
