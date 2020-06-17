import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, ObjectsTableDetailField, TableAction, TableColumn } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { Module } from "../../../../domain/modules/entities/Module";
import { useAppContext } from "../../contexts/AppContext";

interface ModulesListTableProps {
    onActionButtonClick?: (event: React.MouseEvent<unknown, MouseEvent>) => void;
}

export const ModulesListTable: React.FC<ModulesListTableProps> = ({ onActionButtonClick }) => {
    const { compositionRoot } = useAppContext();
    const [rows, setRows] = useState<Module[]>([]);

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

    useEffect(() => {
        compositionRoot.modules.list.execute().then(setRows);
    }, [compositionRoot]);

    return (
        <ObjectsTable<Module>
            rows={rows}
            columns={columns}
            details={details}
            actions={actions}
            onActionButtonClick={onActionButtonClick}
        />
    );
};
