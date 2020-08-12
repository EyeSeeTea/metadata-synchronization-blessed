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
import React, { useCallback, useEffect, useState } from "react";
import { Package } from "../../../../domain/packages/entities/Package";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { ModuleListPageProps } from "../../../webapp/pages/module-list/ModuleListPage";
import { useAppContext } from "../../contexts/AppContext";

type ListPackage = Omit<Package, "contents">;

export const PackagesListTable: React.FC<ModuleListPageProps> = ({
    remoteInstance,
    onActionButtonClick,
    presentation = "app",
    externalComponents,
    openSyncSummary = _.noop,
    paginationOptions,
}) => {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [rows, setRows] = useState<ListPackage[]>([]);
    const [resetKey, setResetKey] = useState(Math.random());
    const [selection, updateSelection] = useState<TableSelection[]>([]);

    const deletePackages = useCallback(
        async (ids: string[]) => {
            loading.show(true, "Deleting packages");
            for (const id of ids) {
                await compositionRoot.packages.delete(id);
            }
            loading.reset();
            setResetKey(Math.random());
            updateSelection([]);
        },
        [compositionRoot, loading]
    );

    const updateTable = useCallback(
        ({ selection }: TableState<ListPackage>) => {
            updateSelection(selection);
        },
        [updateSelection]
    );

    const downloadPackage = useCallback(
        async (ids: string[]) => {
            try {
                compositionRoot.packages.download(ids[0], remoteInstance);
            } catch (error) {
                snackbar.error(i18n.t("Invalid package"));
            }
        },
        [compositionRoot, remoteInstance, snackbar]
    );

    const publishPackage = useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Publishing package to Store"));
            const validation = await compositionRoot.packages.publish(ids[0]);
            validation.match({
                success: () => {
                    loading.reset();
                    snackbar.success(i18n.t("Package published to store"));
                },
                error: code => {
                    loading.reset();
                    switch (code) {
                        case "BAD_CREDENTIALS":
                        case "NO_TOKEN":
                        case "STORE_NOT_FOUND":
                            snackbar.error("Store is not properly configured");
                            return;
                        case "PACKAGE_NOT_FOUND":
                            snackbar.error("Could not read package");
                            return;
                        case "WRITE_PERMISSIONS":
                            snackbar.error("You don't have permissions to create file on GitHub");
                            return;
                        case "UNKNOWN":
                            snackbar.error("Unknown error while creating file on GitHub");
                            return;
                        case "BRANCH_NOT_FOUND":
                            snackbar.error("Branch not found");
                            return;
                        default:
                            snackbar.error("Unknown error");
                    }
                },
            });
        },
        [compositionRoot, snackbar, loading]
    );

    const importPackage = useCallback(
        async (ids: string[]) => {
            const result = await compositionRoot.packages.get(ids[0], remoteInstance);
            result.match({
                success: async ({ name, contents }) => {
                    try {
                        loading.show(true, i18n.t("Importing package {{name}}", { name }));
                        const result = await compositionRoot.metadata.import(contents);

                        const report = SyncReport.create("metadata");
                        report.setStatus(
                            result.status === "ERROR" || result.status === "NETWORK ERROR"
                                ? "FAILURE"
                                : "DONE"
                        );
                        report.addSyncResult(result);
                        await report.save(api);

                        openSyncSummary(report);
                    } catch (error) {
                        snackbar.error(error.message);
                    }
                    loading.reset();
                },
                error: async () => {
                    snackbar.error(i18n.t("Couldn't load package"));
                },
            });
        },
        [compositionRoot, api, loading, remoteInstance, snackbar, openSyncSummary]
    );

    const columns: TableColumn<ListPackage>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        { name: "description", text: i18n.t("Description"), sortable: true, hidden: true },
        { name: "version", text: i18n.t("Version"), sortable: true },
        { name: "dhisVersion", text: i18n.t("DHIS2 Version"), sortable: true },
        { name: "module", text: i18n.t("Module"), sortable: true },
        { name: "created", text: i18n.t("Created"), sortable: true, hidden: true },
        { name: "user", text: i18n.t("Created by"), sortable: true, hidden: true },
    ];

    const details: ObjectsTableDetailField<ListPackage>[] = [
        { name: "id", text: i18n.t("ID") },
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
        { name: "version", text: i18n.t("Version") },
        { name: "dhisVersion", text: i18n.t("DHIS2 Version") },
        { name: "module", text: i18n.t("Module") },
        { name: "created", text: i18n.t("Created") },
        { name: "user", text: i18n.t("Created by") },
    ];

    const actions: TableAction<ListPackage>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: true,
            onClick: deletePackages,
            icon: <Icon>delete</Icon>,
            isActive: () => presentation === "app" && !remoteInstance,
        },
        {
            name: "download",
            text: i18n.t("Download as JSON"),
            multiple: false,
            onClick: downloadPackage,
            icon: <Icon>cloud_download</Icon>,
        },
        {
            name: "publish",
            text: i18n.t("Publish to Store"),
            multiple: false,
            onClick: publishPackage,
            icon: <Icon>publish</Icon>,
            isActive: () => presentation === "app" && !remoteInstance,
        },
        {
            name: "import",
            text: i18n.t("Import package"),
            multiple: false,
            onClick: importPackage,
            icon: <Icon>arrow_downward</Icon>,
            isActive: () => presentation === "app" && !!remoteInstance,
        },
    ];

    useEffect(() => {
        compositionRoot.packages
            .list(remoteInstance)
            .then(setRows)
            .catch((error: Error) => {
                snackbar.error(error.message);
                setRows([]);
            });
    }, [compositionRoot, remoteInstance, resetKey, snackbar]);

    return (
        <ObjectsTable<ListPackage>
            rows={rows}
            columns={columns}
            details={details}
            actions={actions}
            onActionButtonClick={onActionButtonClick}
            forceSelectionColumn={presentation === "app"}
            filterComponents={externalComponents}
            selection={selection}
            onChange={updateTable}
            paginationOptions={paginationOptions}
        />
    );
};
