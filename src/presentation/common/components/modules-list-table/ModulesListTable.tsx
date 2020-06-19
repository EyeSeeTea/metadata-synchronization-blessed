import i18n from "@dhis2/d2-i18n";
import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Module } from "../../../../domain/modules/entities/Module";
import { useAppContext } from "../../contexts/AppContext";

type ModulesListPresentations = "app" | "widget";

interface ModulesListTableProps {
    onActionButtonClick?: (event: React.MouseEvent<unknown, MouseEvent>) => void;
    presentation?: ModulesListPresentations;
}

export const ModulesListTable: React.FC<ModulesListTableProps> = ({
    onActionButtonClick,
    presentation = "app",
}) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [rows, setRows] = useState<Module[]>([]);
    console.log(presentation);

    const downloadModule = useCallback(
        async (modules: string[]) => {
            const module = _.find(rows, ({ id }) => id === modules[0]);
            if (!module) snackbar.error("Invalid module");
            else compositionRoot.modules.download(module);
        },
        [compositionRoot, rows, snackbar]
    );

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
        {
            name: "download",
            text: i18n.t("Download"),
            multiple: false,
            onClick: downloadModule,
        },
        {
            name: "package-data-store",
            text: i18n.t("Generate package from module (Data Store)"),
            multiple: false,
        },
        {
            name: "package-github",
            text: i18n.t("Generate package from module (GitHub)"),
            multiple: false,
        },
    ];

    useEffect(() => {
        compositionRoot.modules.list().then(setRows);
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
