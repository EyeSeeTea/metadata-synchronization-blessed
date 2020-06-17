import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, ObjectsTableDetailField, TableAction, TableColumn } from "d2-ui-components";
import React from "react";
import { Module } from "../../../../domain/modules/entities/Module";

export const ModulesListTable: React.FC = () => {
    const columns: TableColumn<Module>[] = [{ name: "name", text: i18n.t("Name"), sortable: true }];

    const details: ObjectsTableDetailField<Module>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
    ];

    const actions: TableAction<Module>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
    ];

    return (
        <ObjectsTable<Module> rows={[]} columns={columns} details={details} actions={actions} />
    );
};
