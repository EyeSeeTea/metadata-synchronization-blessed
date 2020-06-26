import i18n from "@dhis2/d2-i18n";
import { Icon } from "@material-ui/core";
import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { Module } from "../../../../domain/modules/entities/Module";
import { Package } from "../../../../domain/modules/entities/Package";
import { useAppContext } from "../../contexts/AppContext";
import { NewPacakgeDialog } from "./NewPackageDialog";

type ModulesListPresentation = "app" | "widget";

interface ModulesListTableProps {
    remoteInstance?: Instance;
    onActionButtonClick?: (event: React.MouseEvent<unknown, MouseEvent>) => void;
    presentation?: ModulesListPresentation;
    externalComponents?: ReactNode;
}

export const ModulesListTable: React.FC<ModulesListTableProps> = ({
    remoteInstance,
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
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [newPackageModule, setNewPackageModule] = useState<Module>();
    const [selection, updateSelection] = useState<TableSelection[]>([]);

    const editRule = useCallback(
        (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid module"));
            else history.push({ pathname: `/modules/edit`, state: { module: item } });
        },
        [rows, history, snackbar]
    );

    const downloadSnapshot = useCallback(
        async (ids: string[]) => {
            const module = _.find(rows, ({ id }) => id === ids[0]);
            if (!module) snackbar.error(i18n.t("Invalid module"));
            else {
                loading.show(true, i18n.t("Downloading snapshot for module {{name}}", module));

                const builder = module.toSyncBuilder();
                const contents = await compositionRoot
                    .sync(remoteInstance)
                    [module.type](builder)
                    .buildPayload();

                await compositionRoot.modules(remoteInstance).download(module, contents);
                loading.reset();
            }
        },
        [compositionRoot, remoteInstance, rows, snackbar, loading]
    );

    const createPackage = useCallback(
        async (ids: string[]) => {
            const module = _.find(rows, ({ id }) => id === ids[0]);
            if (!module) snackbar.error(i18n.t("Invalid module"));
            else setNewPackageModule(module);
        },
        [rows, snackbar]
    );

    const savePackage = useCallback(
        async (item: Package, versions: string[]) => {
            setNewPackageModule(undefined);
            const module = _.find(rows, ({ id }) => id === item.module.id);
            if (!module) snackbar.error(i18n.t("Invalid module"));
            else {
                for (const dhisVersion of versions) {
                    loading.show(
                        true,
                        i18n.t("Creating {{dhisVersion}} package for module {{name}}", {
                            name: module.name,
                            dhisVersion,
                        })
                    );

                    const builder = module.toSyncBuilder();
                    const contents = await compositionRoot
                        .sync()
                        [module.type](builder)
                        .buildPayload();

                    const newPackage = item.update({ contents, dhisVersion });
                    await compositionRoot.packages().create(newPackage, module);
                }

                loading.reset();
                setResetKey(Math.random());
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
            loading.show(true, "Deleting modules");
            for (const id of ids) {
                await compositionRoot.modules().delete(id);
            }
            loading.reset();
            setResetKey(Math.random());
            updateSelection([]);
        },
        [compositionRoot, loading]
    );

    const updateTable = useCallback(
        ({ selection }: TableState<Module>) => {
            updateSelection(selection);
        },
        [updateSelection]
    );

    const columns: TableColumn<Module>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        { name: "department", text: i18n.t("Department"), sortable: true },
        { name: "description", text: i18n.t("Description"), sortable: true, hidden: true },
        {
            name: "metadataIds",
            text: "Selected metadata",
            getValue: module => `${module.metadataIds.length} elements`,
        },
    ];

    const details: ObjectsTableDetailField<Module>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "department", text: i18n.t("Department") },
        { name: "description", text: i18n.t("Description") },
        {
            name: "metadataIds",
            text: "Selected metadata",
            getValue: module => `${module.metadataIds.length} elements`,
        },
    ];

    const actions: TableAction<Module>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            primary: presentation !== "app" && !remoteInstance,
        },
        {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            isActive: () => presentation === "app" && !remoteInstance,
            onClick: editRule,
            primary: presentation === "app" && !remoteInstance,
            icon: <Icon>edit</Icon>,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: true,
            isActive: () => presentation === "app" && !remoteInstance,
            onClick: deleteModule,
            icon: <Icon>delete</Icon>,
        },
        {
            name: "replicate",
            text: i18n.t("Replicate"),
            multiple: false,
            onClick: replicateModule,
            icon: <Icon>content_copy</Icon>,
            isActive: () => presentation === "app" && !remoteInstance,
        },
        {
            name: "download",
            text: i18n.t("Download snapshot package"),
            multiple: false,
            onClick: downloadSnapshot,
            icon: <Icon>cloud_download</Icon>,
        },
        {
            name: "package-data-store",
            text: i18n.t("Generate package from module"),
            multiple: false,
            icon: <Icon>description</Icon>,
            isActive: () => presentation === "app" && !remoteInstance,
            onClick: createPackage,
        },
    ];

    useEffect(() => {
        setIsTableLoading(true);
        compositionRoot
            .modules(remoteInstance)
            .list()
            .then(rows => {
                setRows(rows);
                setIsTableLoading(false);
            })
            .catch((error: Error) => {
                snackbar.error(error.message);
                setRows([]);
                setIsTableLoading(false);
            });
    }, [compositionRoot, remoteInstance, resetKey, snackbar, setIsTableLoading]);

    return (
        <React.Fragment>
            {!!newPackageModule && (
                <NewPacakgeDialog
                    save={savePackage}
                    close={() => setNewPackageModule(undefined)}
                    module={newPackageModule}
                />
            )}

            <ObjectsTable<Module>
                rows={rows}
                loading={isTableLoading}
                columns={columns}
                details={details}
                actions={actions}
                onActionButtonClick={onActionButtonClick}
                forceSelectionColumn={true}
                filterComponents={externalComponents}
                selection={selection}
                onChange={updateTable}
            />
        </React.Fragment>
    );
};
