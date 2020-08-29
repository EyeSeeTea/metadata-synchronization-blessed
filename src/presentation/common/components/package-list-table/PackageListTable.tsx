import { Icon } from "@material-ui/core";
import {
    ConfirmationDialog,
    ConfirmationDialogProps,
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Package } from "../../../../domain/packages/entities/Package";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { isAppConfigurator } from "../../../../utils/permissions";
import Dropdown from "../../../webapp/components/dropdown/Dropdown";
import {
    PackagesDiffDialog,
    PackageToDiff,
} from "../../../webapp/components/packages-diff-dialog/PackagesDiffDialog";
import { ModulePackageListPageProps } from "../../../webapp/pages/module-package-list/ModulePackageListPage";
import { useAppContext } from "../../contexts/AppContext";

type ListPackage = Omit<Package, "contents">;

export const PackagesListTable: React.FC<ModulePackageListPageProps> = ({
    remoteInstance,
    showStore,
    onActionButtonClick,
    presentation = "app",
    externalComponents,
    openSyncSummary = _.noop,
    paginationOptions,
}) => {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [instancePackages, setInstancePackages] = useState<ListPackage[]>([]);
    const [storePackages, setStorePackages] = useState<ListPackage[]>([]);
    const rows = showStore ? storePackages : instancePackages;

    const [resetKey, setResetKey] = useState(Math.random());
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [packageToDiff, setPackageToDiff] = useState<PackageToDiff | null>(null);
    const [moduleFilter, setModuleFilter] = useState("");
    const [appConfigurator, setAppConfigurator] = useState(false);

    const isRemoteInstance = !!remoteInstance;

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
                compositionRoot.packages.download(showStore, ids[0], remoteInstance);
            } catch (error) {
                snackbar.error(i18n.t("Invalid package"));
            }
        },
        [compositionRoot, remoteInstance, snackbar, showStore]
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
                            snackbar.error(i18n.t("Store is not properly configured"));
                            return;
                        case "PACKAGE_NOT_FOUND":
                            snackbar.error(i18n.t("Could not read package"));
                            return;
                        case "WRITE_PERMISSIONS":
                            snackbar.error(
                                i18n.t("You don't have permissions to create file on GitHub")
                            );
                            return;
                        case "UNKNOWN":
                            snackbar.error(i18n.t("Unknown error while creating file on GitHub"));
                            return;
                        case "ALREADY_PUBLISHED":
                            snackbar.warning(i18n.t("Package already published"));
                            return;
                        case "BRANCH_NOT_FOUND":
                            updateDialog({
                                title: i18n.t("Branch not found"),
                                description: i18n.t(
                                    "There are no branches for the department of this module. Do you want to create a new branch for this department?"
                                ),
                                onCancel: () => {
                                    updateDialog(null);
                                },
                                onSave: async () => {
                                    updateDialog(null);
                                    loading.show(true, i18n.t("Publishing package to Store"));
                                    const validation = await compositionRoot.packages.publish(
                                        ids[0],
                                        true
                                    );
                                    validation.match({
                                        success: () =>
                                            snackbar.success(
                                                i18n.t("Package published to store in a new branch")
                                            ),
                                        error: () =>
                                            snackbar.error(
                                                i18n.t("Couldn't create new branch on store")
                                            ),
                                    });
                                    loading.reset();
                                },
                                cancelText: i18n.t("Cancel"),
                                saveText: i18n.t("Proceed"),
                            });
                            return;
                        default:
                            snackbar.error(i18n.t("Unknown error"));
                    }
                },
            });
        },
        [compositionRoot, snackbar, loading]
    );

    const openPackageDiffDialog = useCallback(
        async (ids: string[]) => {
            const packageId = _(ids).get(0, null);
            const remotePackage = packageId ? rows.find(row => row.id === packageId) : undefined;
            if (packageId && remotePackage) {
                setPackageToDiff({ id: packageId, name: remotePackage.name });
            }
        },
        [rows, setPackageToDiff]
    );

    const closePackageDiffDialog = useCallback(() => setPackageToDiff(null), [setPackageToDiff]);

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
                        report.addSyncResult({
                            ...result,
                            origin: remoteInstance?.toPublicObject(),
                        });
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

    const columns: TableColumn<ListPackage>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name"), sortable: true },
            { name: "description", text: i18n.t("Description"), sortable: true, hidden: true },
            { name: "version", text: i18n.t("Version"), sortable: true },
            { name: "dhisVersion", text: i18n.t("DHIS2 Version"), sortable: true },
            { name: "module", text: i18n.t("Module"), sortable: true },
            { name: "created", text: i18n.t("Created"), sortable: true, hidden: true },
            { name: "user", text: i18n.t("Created by"), sortable: true, hidden: true },
        ],
        []
    );

    const details: ObjectsTableDetailField<ListPackage>[] = useMemo(
        () => [
            { name: "id", text: i18n.t("ID") },
            { name: "name", text: i18n.t("Name") },
            { name: "description", text: i18n.t("Description") },
            { name: "version", text: i18n.t("Version") },
            { name: "dhisVersion", text: i18n.t("DHIS2 Version") },
            { name: "module", text: i18n.t("Module") },
            { name: "created", text: i18n.t("Created") },
            { name: "user", text: i18n.t("Created by") },
        ],
        []
    );

    const actions: TableAction<ListPackage>[] = useMemo(
        () => [
            {
                name: "details",
                text: i18n.t("Details"),
                multiple: false,
                primary: true,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                onClick: deletePackages,
                icon: <Icon>delete</Icon>,
                isActive: () =>
                    presentation === "app" && !isRemoteInstance && !showStore && appConfigurator,
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
                isActive: () =>
                    presentation === "app" && !isRemoteInstance && !showStore && appConfigurator,
            },
            {
                name: "compare-with-local",
                text: i18n.t("Compare with local instance"),
                multiple: false,
                icon: <Icon>compare</Icon>,
                isActive: () =>
                    presentation === "app" && (isRemoteInstance || showStore) && appConfigurator,
                onClick: openPackageDiffDialog,
            },
            {
                name: "import",
                text: i18n.t("Import package"),
                multiple: false,
                onClick: importPackage,
                icon: <Icon>arrow_downward</Icon>,
                isActive: () => presentation === "app" && isRemoteInstance && appConfigurator,
            },
        ],
        [
            appConfigurator,
            deletePackages,
            downloadPackage,
            importPackage,
            isRemoteInstance,
            openPackageDiffDialog,
            presentation,
            publishPackage,
            showStore,
        ]
    );

    const moduleFilterItems = useMemo(() => {
        return _(instancePackages)
            .map(instancePackage => instancePackage.module)
            .uniqBy(({ id }) => id)
            .sortBy(({ name }) => name)
            .value();
    }, [instancePackages]);

    const filterComponents = useMemo(() => {
        const moduleFilterComponent = (
            <Dropdown
                key="filter-module"
                items={moduleFilterItems}
                onValueChange={setModuleFilter}
                value={moduleFilter}
                label={i18n.t("Module")}
            />
        );

        return [externalComponents, moduleFilterComponent];
    }, [externalComponents, moduleFilter, moduleFilterItems]);

    const rowsFiltered = useMemo(() => {
        return moduleFilter ? rows.filter(row => row.module.id === moduleFilter) : rows;
    }, [moduleFilter, rows]);

    useEffect(() => {
        compositionRoot.packages
            .list(remoteInstance)
            .then(setInstancePackages)
            .catch((error: Error) => {
                snackbar.error(error.message);
                setInstancePackages([]);
            });
    }, [compositionRoot, remoteInstance, resetKey, snackbar]);

    useEffect(() => {
        compositionRoot.packages.listStore().then(validation =>
            validation.match({
                success: setStorePackages,
                error: () => snackbar.error(i18n.t("Can't connect to store")),
            })
        );
    }, [compositionRoot, snackbar]);

    useEffect(() => {
        setModuleFilter("");
    }, [remoteInstance]);

    useEffect(() => {
        isAppConfigurator(api).then(setAppConfigurator);
    }, [api]);

    return (
        <React.Fragment>
            <ObjectsTable<ListPackage>
                rows={rowsFiltered}
                columns={columns}
                details={details}
                actions={actions}
                onActionButtonClick={onActionButtonClick}
                forceSelectionColumn={presentation === "app"}
                filterComponents={filterComponents}
                selection={selection}
                onChange={updateTable}
                paginationOptions={paginationOptions}
            />

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            {packageToDiff && (
                <PackagesDiffDialog
                    onClose={closePackageDiffDialog}
                    remotePackage={packageToDiff}
                    isStorePackage={showStore}
                    remoteInstance={remoteInstance}
                />
            )}
        </React.Fragment>
    );
};
