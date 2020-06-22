import i18n from "@dhis2/d2-i18n";
import { Icon } from "@material-ui/core";
import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Module } from "../../../../domain/modules/entities/Module";
import { useAppContext } from "../../contexts/AppContext";

type ModulesListPresentation = "app" | "widget";

interface ModulesListTableProps {
    onActionButtonClick?: (event: React.MouseEvent<unknown, MouseEvent>) => void;
    presentation?: ModulesListPresentation;
    externalComponents?: ReactNode;
}

export const ModulesListTable: React.FC<ModulesListTableProps> = ({
    onActionButtonClick,
    presentation = "app",
    externalComponents,
}) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const history = useHistory();
    const [rows, setRows] = useState<Module[]>([]);
    const [resetKey, setResetKey] = useState(Math.random());

    const editRule = useCallback(
        (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid module"));
            else history.push({ pathname: `/modules/edit`, state: { module: item } });
        },
        [rows, history, snackbar]
    );

    const downloadModule = useCallback(
        async (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid module"));
            else compositionRoot.modules.download(item);
        },
        [compositionRoot, rows, snackbar]
    );

    const createPackage = useCallback(
        async (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid module"));
            else {
                loading.show(true, i18n.t("Creating package for module {{name}}", item));
                const builder = item.toSyncBuilder();
                const contents = await compositionRoot.sync[item.type](builder).buildPayload();
                await compositionRoot.packages.create({
                    location: "dataStore",
                    module: item,
                    contents,
                });
                loading.reset();
                snackbar.success(i18n.t("Successfully created package"));
            }
        },
        [compositionRoot, rows, snackbar, loading]
    );

    const replicateModule = useCallback(
        async (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid module"));
            else
                history.push({
                    pathname: `/modules/new`,
                    state: { module: item.replicate() },
                });
        },
        [history, rows, snackbar]
    );

    const deleteModule = useCallback(
        async (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid module"));
            else {
                loading.show(true, "Deleting package");
                await compositionRoot.modules.delete(item.id);
                loading.reset();
                setResetKey(Math.random());
            }
        },
        [compositionRoot, rows, snackbar, loading, setResetKey]
    );

    const columns: TableColumn<Module>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        { name: "description", text: i18n.t("Description"), sortable: true },
        {
            name: "metadataIds",
            text: "Selected metadata",
            getValue: module => `${module.metadataIds.length} elements`,
        },
    ];

    const details: ObjectsTableDetailField<Module>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
    ];

    const actions: TableAction<Module>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            primary: presentation !== "app",
        },
        {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            isActive: () => presentation === "app",
            onClick: editRule,
            primary: presentation === "app",
            icon: <Icon>edit</Icon>,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: false,
            onClick: deleteModule,
            icon: <Icon>delete</Icon>,
        },
        {
            name: "replicate",
            text: i18n.t("Replicate"),
            multiple: false,
            onClick: replicateModule,
            icon: <Icon>content_copy</Icon>,
            isActive: () => presentation === "app",
        },
        {
            name: "download",
            text: i18n.t("Download"),
            multiple: false,
            onClick: downloadModule,
            icon: <Icon>cloud_download</Icon>,
        },
        {
            name: "package-data-store",
            text: i18n.t("Generate package from module (Data Store)"),
            multiple: false,
            icon: <Icon>description</Icon>,
            onClick: createPackage,
        },
        {
            name: "package-github",
            text: i18n.t("Generate package from module (GitHub)"),
            multiple: false,
            icon: <Icon>description</Icon>,
        },
    ];

    useEffect(() => {
        compositionRoot.modules.list().then(setRows);
    }, [compositionRoot, resetKey]);

    return (
        <ObjectsTable<Module>
            rows={rows}
            columns={columns}
            details={details}
            actions={actions}
            onActionButtonClick={onActionButtonClick}
            forceSelectionColumn={true}
            filterComponents={externalComponents}
        />
    );
};
