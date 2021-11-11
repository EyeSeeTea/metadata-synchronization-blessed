import { Icon } from "@material-ui/core";
import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    ObjectsTable,
    ObjectsTableDetailField,
    RowConfig,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import semver from "semver";
import { Either } from "../../../../../domain/common/entities/Either";
import { NamedRef } from "../../../../../domain/common/entities/Ref";
import { JSONDataSource } from "../../../../../domain/instance/entities/JSONDataSource";
import { Module } from "../../../../../domain/modules/entities/Module";
import { ImportedPackage } from "../../../../../domain/package-import/entities/ImportedPackage";
import { isInstance, isStore, PackageSource } from "../../../../../domain/package-import/entities/PackageSource";
import { mapToImportedPackage } from "../../../../../domain/package-import/mappers/ImportedPackageMapper";
import { ListPackage, Package } from "../../../../../domain/packages/entities/Package";
import { SynchronizationReport } from "../../../../../domain/reports/entities/SynchronizationReport";
import i18n from "../../../../../locales";
import { isAppConfigurator, isGlobalAdmin } from "../../../../../utils/permissions";
import { ModulePackageListPageProps } from "../../../../webapp/core/pages/module-package-list/ModulePackageListPage";
import { useAppContext } from "../../contexts/AppContext";
import Dropdown from "../dropdown/Dropdown";
import PackageImportDialog from "../package-import-dialog/PackageImportDialog";
import { DiffPackages, PackagesDiffDialog } from "../packages-diff-dialog/PackagesDiffDialog";
import {
    groupPackageByModuleAndVersion as groupPackagesByModuleAndVersion,
    InstallStatus,
    isPackageItem,
    PackageItem,
    PackageModuleItem,
} from "./PackageModuleItem";

interface PackagesListTableProps extends ModulePackageListPageProps {
    isImportDialog?: boolean;
    onSelectionChange?: (ids: string[]) => void;
    selectedIds?: string[];
}

export const PackagesListTable: React.FC<PackagesListTableProps> = ({
    remoteInstance,
    remoteStore,
    onActionButtonClick,
    presentation = "app",
    externalComponents,
    openSyncSummary = _.noop,
    paginationOptions,
    isImportDialog = false,
    onSelectionChange,
    selectedIds,
    actionButtonLabel,
}) => {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [instancePackages, setInstancePackages] = useState<PackageItem[]>([]);
    const [storePackages, setStorePackages] = useState<PackageItem[]>([]);
    const [importedPackages, setImportedPackages] = useState<ImportedPackage[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const rows = remoteStore ? storePackages : instancePackages;

    const [resetKey, setResetKey] = useState(Math.random());
    const [stateSelection, updateStateSelection] = useState<TableSelection[]>([]);
    const selection = selectedIds?.map(id => ({ id })) ?? stateSelection;

    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [packagesToDiff, setPackagesToDiff] = useState<DiffPackages | null>(null);
    const [moduleFilter, setModuleFilter] = useState("");
    const [dhis2VersionFilter, setDhis2VersionFilter] = useState("");
    const [localDhis2Version, setLocalDhis2Version] = useState("");
    const [installStatusFilter, setInstallStatusFilter] = useState("");

    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [appConfigurator, setAppConfigurator] = useState(false);
    const [loadingTable, setLoadingTable] = useState(true);
    const [openImportPackageDialog, setOpenImportPackageDialog] = useState(false);

    const [toImportWizard, setToImportWizard] = useState<string[]>([]);

    const isRemoteInstance = !!remoteInstance;

    useEffect(() => {
        compositionRoot.modules.list(globalAdmin, remoteInstance, true).then(setModules);
    }, [compositionRoot, globalAdmin, remoteInstance]);

    const updateSelection = useCallback(
        (selection: TableSelection[]) => {
            updateStateSelection(selection);

            if (onSelectionChange) {
                onSelectionChange(selection.map(selection => selection.id));
            }
        },
        [onSelectionChange]
    );

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
        [compositionRoot, loading, updateSelection]
    );

    const updateTable = useCallback(
        ({ selection }: TableState<PackageModuleItem>) => {
            updateSelection(selection);
        },
        [updateSelection]
    );

    const downloadPackage = useCallback(
        async (ids: string[]) => {
            try {
                compositionRoot.packages.download(remoteStore?.id, ids[0], remoteInstance);
            } catch (error: any) {
                snackbar.error(i18n.t("Invalid package"));
            }
        },
        [compositionRoot, remoteInstance, snackbar, remoteStore]
    );

    const publishPackage = useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Publishing package to Store"));
            const validation = await compositionRoot.packages.publish(ids[0]);
            validation.match({
                success: () => {
                    loading.reset();
                    snackbar.success(i18n.t("Package published to default store"));
                },
                error: code => {
                    loading.reset();
                    switch (code) {
                        case "BAD_CREDENTIALS":
                        case "NO_TOKEN":
                        case "DEFAULT_STORE_NOT_FOUND":
                            snackbar.error(i18n.t("Default store is not properly configured"));
                            return;
                        case "PACKAGE_NOT_FOUND":
                            snackbar.error(i18n.t("Could not read package"));
                            return;
                        case "WRITE_PERMISSIONS":
                            snackbar.error(i18n.t("You don't have permissions to create file on GitHub"));
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
                                    const validation = await compositionRoot.packages.publish(ids[0], true);
                                    validation.match({
                                        success: () =>
                                            snackbar.success(i18n.t("Package published to store in a new branch")),
                                        error: () => snackbar.error(i18n.t("Couldn't create new branch on store")),
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
            if (packageId && remotePackage && isPackageItem(remotePackage)) {
                setPackagesToDiff({ merge: remotePackage });
            }
        },
        [rows, setPackagesToDiff]
    );

    const openPairPackageDiffDialog = useCallback(
        async (ids: string[]) => {
            const [packageBase, packageMerge] = ids.map(packageId => {
                return rows.find(row => row.id === packageId);
            });
            if (packageBase && packageMerge && isPackageItem(packageBase) && isPackageItem(packageMerge)) {
                setPackagesToDiff({ base: packageBase, merge: packageMerge });
            }
        },
        [rows, setPackagesToDiff]
    );

    const closePackageDiffDialog = useCallback(() => setPackagesToDiff(null), [setPackagesToDiff]);

    const saveImportedPackage = useCallback(
        async (pkg: Package, author: NamedRef, packageSource: PackageSource, storePackageUrl?: string) => {
            const importedPackage = mapToImportedPackage(pkg, author, packageSource, storePackageUrl);

            const result = await compositionRoot.importedPackages.save([importedPackage]);

            result.match({
                success: () => {},
                error: () => {
                    snackbar.error("An error has ocurred tracking the imported package");
                },
            });
        },
        [compositionRoot, snackbar]
    );

    const getPackage = useCallback(
        (packageSource: PackageSource, packageId: string): Promise<Either<"NOT_FOUND", Package>> => {
            if (isInstance(packageSource)) {
                return compositionRoot.packages.get(packageId, packageSource);
            } else {
                return compositionRoot.packages.getStore(packageSource.id, packageId);
            }
        },
        [compositionRoot]
    );

    const getPackageSourceToImport = useCallback(() => {
        if (remoteInstance) {
            return remoteInstance;
        } else if (remoteStore) {
            return remoteStore;
        } else {
            throw new Error("The import action is only available for remote package source");
        }
    }, [remoteInstance, remoteStore]);

    const importPackagesFromWizard = useCallback((ids: string[]) => {
        setToImportWizard(ids);
        setOpenImportPackageDialog(true);
    }, []);

    const generateModule = useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Generating module"));

            const selectedPackage = rows.find(row => row.id === ids[0]);
            const module = selectedPackage
                ? modules.find(module => selectedPackage.module && module.id === selectedPackage.module.id)
                : undefined;

            if (module) {
                const editedModule = module?.update({ autogenerated: false });

                const moduleErrors = await compositionRoot.modules.save(editedModule);

                if (moduleErrors.length === 0) {
                    loading.reset();
                    snackbar.success(i18n.t("Module generated successfully"));
                } else {
                    loading.reset();
                    snackbar.error(moduleErrors.map(error => error.description).join("\n"));
                }
            } else {
                loading.reset();
                snackbar.error(i18n.t("An error has ocurred generating the module"));
            }
        },
        [compositionRoot, rows, modules, snackbar, loading]
    );

    const importPackage = useCallback(
        async (ids: string[]) => {
            const packageSource: PackageSource = getPackageSourceToImport();

            const result = await getPackage(packageSource, ids[0]);

            result.match({
                success: async originPackage => {
                    try {
                        const currentUser = await api.currentUser
                            .get({ fields: { id: true, userCredentials: { username: true } } })
                            .getData();

                        loading.show(true, i18n.t("Importing package {{name}}", { name: originPackage.name }));

                        const mapping = await compositionRoot.mapping.get({
                            type: isInstance(packageSource) ? "instance" : "store",
                            id: packageSource.id,
                            moduleId: originPackage.module.id,
                        });

                        const originDataSource =
                            remoteInstance && isInstance(packageSource)
                                ? remoteInstance
                                : JSONDataSource.build(originPackage.dhisVersion, originPackage.contents);

                        const result = await compositionRoot.packages.import(
                            originPackage,
                            mapping?.mappingDictionary,
                            originDataSource
                        );

                        const report = SynchronizationReport.create(
                            "metadata",
                            currentUser.userCredentials.username ?? "Unknown",
                            true
                        );

                        report.setTypes(_.keys(originPackage.contents));

                        report.setStatus(
                            result.status === "ERROR" || result.status === "NETWORK ERROR" ? "FAILURE" : "DONE"
                        );

                        report.addSyncResult({
                            ...result,
                            originPackage: originPackage.toRef(),
                            origin: remoteInstance?.toPublicObject(),
                        });

                        await compositionRoot.reports.save(report);

                        if (result.status === "SUCCESS") {
                            const author = {
                                id: currentUser.id,
                                name: currentUser.userCredentials.username,
                            };

                            await saveImportedPackage(
                                originPackage,
                                author,
                                packageSource,
                                isStore(packageSource) ? ids[0] : undefined
                            );
                        }

                        openSyncSummary(report);
                        setResetKey(Math.random());
                    } catch (error: any) {
                        snackbar.error(error.message);
                    }
                    loading.reset();
                },
                error: async () => {
                    snackbar.error(i18n.t("Couldn't load package"));
                },
            });
        },
        [
            compositionRoot,
            api,
            loading,
            remoteInstance,
            snackbar,
            openSyncSummary,
            getPackage,
            getPackageSourceToImport,
            saveImportedPackage,
        ]
    );

    const getInstallStatusText = (installStatus: InstallStatus): string => {
        switch (installStatus) {
            case "Installed":
                return i18n.t("Installed");
            case "NotInstalled":
                return i18n.t("Not Installed");
            case "Upgrade":
                return i18n.t("Upgrade Available");
            case "InstalledLocalPackage":
                return i18n.t("Local Package (Installed)");
            case "NotInstalledLocalPackage":
                return i18n.t("Local Package (Not Installed)");
        }
    };

    const columns: TableColumn<PackageModuleItem>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name"), sortable: true },
            { name: "description", text: i18n.t("Description"), sortable: true, hidden: true },
            { name: "version", text: i18n.t("Version"), sortable: true },
            { name: "dhisVersion", text: i18n.t("DHIS2 Version"), sortable: true },
            { name: "created", text: i18n.t("Created"), sortable: true, hidden: true },
            { name: "user", text: i18n.t("Created by"), sortable: true, hidden: true },
            {
                name: "installStatus",
                text: i18n.t("Status"),
                sortable: true,
                getValue: (row: PackageModuleItem) =>
                    isPackageItem(row) ? getInstallStatusText(row.installStatus) : undefined,
            },
        ],
        []
    );

    const details: ObjectsTableDetailField<PackageModuleItem>[] = useMemo(
        () => [
            { name: "id", text: i18n.t("ID") },
            { name: "name", text: i18n.t("Name") },
            { name: "description", text: i18n.t("Description") },
            { name: "version", text: i18n.t("Version") },
            { name: "dhisVersion", text: i18n.t("DHIS2 Version") },
            { name: "module", text: i18n.t("Module") },
            { name: "created", text: i18n.t("Created") },
            { name: "user", text: i18n.t("Created by") },
            {
                name: "installStatus",
                text: i18n.t("Status"),
                getValue: (row: PackageModuleItem) =>
                    isPackageItem(row) ? getInstallStatusText(row.installStatus) : undefined,
            },
        ],
        []
    );

    const actions: TableAction<PackageModuleItem>[] = useMemo(
        () => [
            {
                name: "details",
                text: i18n.t("Details"),
                multiple: false,
                primary: true,
                isActive: (rows: PackageModuleItem[]) => _.every(rows, row => isPackageItem(row)),
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                onClick: deletePackages,
                icon: <Icon>delete</Icon>,
                isActive: (rows: PackageModuleItem[]) =>
                    _.every(rows, row => isPackageItem(row)) &&
                    !isImportDialog &&
                    presentation === "app" &&
                    !isRemoteInstance &&
                    !remoteStore &&
                    appConfigurator,
            },
            {
                name: "download",
                text: i18n.t("Download as JSON"),
                multiple: false,
                onClick: downloadPackage,
                icon: <Icon>cloud_download</Icon>,
                isActive: (rows: PackageModuleItem[]) => _.every(rows, row => isPackageItem(row)),
            },
            {
                name: "publish",
                text: i18n.t("Publish to Store"),
                multiple: false,
                onClick: publishPackage,
                icon: <Icon>publish</Icon>,
                isActive: (rows: PackageModuleItem[]) =>
                    _.every(rows, row => isPackageItem(row)) &&
                    !isImportDialog &&
                    presentation === "app" &&
                    !isRemoteInstance &&
                    !remoteStore &&
                    appConfigurator,
            },
            {
                name: "compare-with-local",
                text: i18n.t("Compare with local instance"),
                multiple: false,
                icon: <Icon>compare</Icon>,
                isActive: (rows: PackageModuleItem[]) =>
                    _.every(rows, row => isPackageItem(row)) &&
                    presentation === "app" &&
                    (isRemoteInstance || remoteStore !== undefined) &&
                    appConfigurator,
                onClick: openPackageDiffDialog,
            },
            {
                name: "compare-selected-packages",
                text: i18n.t("Compare selected packages"),
                multiple: true,
                icon: <Icon>compare_arrows</Icon>,
                isActive: (rows: PackageModuleItem[]) =>
                    _.every(rows, row => isPackageItem(row)) &&
                    presentation === "app" &&
                    appConfigurator &&
                    (selectedIds ? selectedIds.length === 2 : false),
                onClick: openPairPackageDiffDialog,
            },
            {
                name: "import",
                text: i18n.t("Import package"),
                multiple: false,
                onClick: importPackage,
                icon: <Icon>arrow_downward</Icon>,
                isActive: (rows: PackageModuleItem[]) =>
                    _.every(rows, row => isPackageItem(row)) &&
                    !isImportDialog &&
                    presentation === "app" &&
                    (isRemoteInstance || remoteStore !== undefined) &&
                    appConfigurator,
            },
            {
                name: "importFromWizard",
                text: i18n.t("Import package (wizard)"),
                multiple: true,
                onClick: importPackagesFromWizard,
                icon: <Icon>arrow_downward</Icon>,
                isActive: (rows: PackageModuleItem[]) =>
                    _.every(rows, row => isPackageItem(row)) &&
                    !isImportDialog &&
                    presentation === "app" &&
                    (isRemoteInstance || remoteStore !== undefined) &&
                    appConfigurator,
            },
            {
                name: "generateModule",
                text: i18n.t("Generate Module"),
                onClick: generateModule,
                icon: <Icon>note_add</Icon>,
                isActive: (rows: PackageModuleItem[]) => {
                    const module = modules.find(module => rows[0].module && module.id === rows[0].module.id);

                    return (
                        _.every(rows, row => isPackageItem(row)) &&
                        !isImportDialog &&
                        presentation === "app" &&
                        rows[0].installStatus === "InstalledLocalPackage" &&
                        module !== undefined &&
                        module.autogenerated === true &&
                        appConfigurator
                    );
                },
            },
        ],
        [
            appConfigurator,
            deletePackages,
            downloadPackage,
            importPackage,
            importPackagesFromWizard,
            isRemoteInstance,
            openPackageDiffDialog,
            openPairPackageDiffDialog,
            presentation,
            publishPackage,
            remoteStore,
            isImportDialog,
            selectedIds,
            generateModule,
            modules,
        ]
    );

    const moduleFilterItems = useMemo(() => {
        const packages = remoteStore ? storePackages : instancePackages;

        return _(packages)
            .map(pkg => pkg.module)
            .uniqBy(({ id }) => id)
            .sortBy(({ name }) => name)
            .value();
    }, [instancePackages, storePackages, remoteStore]);

    const dhis2VersionFilterItems = useMemo(() => {
        const packages = remoteStore ? storePackages : instancePackages;

        return _(packages)
            .map(pkg => ({
                id: pkg.dhisVersion,
                name:
                    localDhis2Version === pkg.dhisVersion
                        ? pkg.dhisVersion
                        : `${pkg.dhisVersion} (${i18n.t("Not recommended")})`,
            }))
            .uniqBy(({ id }) => id)
            .sortBy(({ name }) => name)
            .value();
    }, [instancePackages, storePackages, remoteStore, localDhis2Version]);

    const installStatusFilterItems = useMemo(() => {
        const packages = remoteStore ? storePackages : instancePackages;

        return _(packages)
            .map(pkg => ({
                id: pkg.installStatus,
                name: getInstallStatusText(pkg.installStatus),
            }))
            .uniqBy(({ id }) => id)
            .sortBy(({ name }) => name)
            .value();
    }, [instancePackages, storePackages, remoteStore]);

    const filterComponents = useMemo(() => {
        const updateFilter =
            (fn: Function) =>
            (...args: unknown[]) => {
                fn(...args);
                setResetKey(Math.random());
            };

        const moduleFilterComponent = (
            <Dropdown
                key="filter-module"
                items={moduleFilterItems}
                onValueChange={updateFilter(setModuleFilter)}
                value={moduleFilter}
                label={i18n.t("Module")}
            />
        );

        const dhis2VersionFilterComponent = (
            <Dropdown
                key="filter-dhis2-version"
                items={dhis2VersionFilterItems}
                onValueChange={updateFilter(setDhis2VersionFilter)}
                value={dhis2VersionFilter}
                label={i18n.t("Dhis2 version")}
            />
        );

        const installStateFilterComponent = (
            <Dropdown
                key="filter-install-status"
                items={installStatusFilterItems}
                onValueChange={updateFilter(setInstallStatusFilter)}
                value={installStatusFilter}
                label={i18n.t("Status")}
            />
        );
        return [externalComponents, moduleFilterComponent, dhis2VersionFilterComponent, installStateFilterComponent];
    }, [
        externalComponents,
        moduleFilter,
        moduleFilterItems,
        dhis2VersionFilterItems,
        dhis2VersionFilter,
        installStatusFilterItems,
        installStatusFilter,
    ]);

    const rowsFiltered = useMemo(() => {
        setLoadingTable(false);

        const packageItems = rows.filter(
            row =>
                (row.module.id === moduleFilter || !moduleFilter) &&
                (row.dhisVersion === dhis2VersionFilter || !dhis2VersionFilter) &&
                (row.installStatus === installStatusFilter || !installStatusFilter)
        );

        return groupPackagesByModuleAndVersion(packageItems);
    }, [moduleFilter, rows, dhis2VersionFilter, installStatusFilter]);

    const handleOpenSyncSummaryFromDialog = (syncReport: SynchronizationReport) => {
        setOpenImportPackageDialog(false);
        setToImportWizard([]);
        openSyncSummary(syncReport);
        setResetKey(Math.random());
    };

    const handleCloseImportWizard = () => {
        setOpenImportPackageDialog(false);
        setToImportWizard([]);
    };

    const showImportFromWizardButton = !isImportDialog && presentation === "app" && appConfigurator;

    const packageSource = remoteInstance ?? remoteStore;

    useEffect(() => {
        api.getVersion().then(setLocalDhis2Version);
    }, [api]);

    useEffect(() => {
        setLoadingTable(true);
        compositionRoot.packages
            .list(globalAdmin, remoteInstance)
            .then(packages => {
                setInstancePackages(mapPackagesToPackageItems(modules, packages, importedPackages, packageSource));
            })
            .catch((error: Error) => {
                snackbar.error(error.message);
                setInstancePackages([]);
            });
    }, [
        compositionRoot,
        remoteInstance,
        resetKey,
        snackbar,
        globalAdmin,
        importedPackages,
        remoteStore,
        modules,
        packageSource,
    ]);

    useEffect(() => {
        if (remoteStore) {
            setLoadingTable(true);
            compositionRoot.packages.listStore(remoteStore.id).then(validation => {
                validation.match({
                    success: packages => {
                        setStorePackages(mapPackagesToPackageItems(modules, packages, importedPackages, packageSource));
                    },
                    error: () => {
                        snackbar.error(i18n.t("Can't connect to store"));
                        setStorePackages([]);
                    },
                });
            });
        } else {
            setStorePackages([]);
        }
    }, [compositionRoot, snackbar, remoteStore, importedPackages, remoteInstance, resetKey, modules, packageSource]);

    useEffect(() => {
        compositionRoot.importedPackages.list().then(result =>
            result.match({
                success: setImportedPackages,
                error: () => {
                    snackbar.error(i18n.t("An error has ocurred retrieving imported packages"));
                    setImportedPackages([]);
                },
            })
        );
    }, [compositionRoot, snackbar, resetKey]);

    useEffect(() => {
        setModuleFilter("");
        setDhis2VersionFilter("");
        setInstallStatusFilter("");
        setResetKey(Math.random());
    }, [remoteInstance, remoteStore]);

    useEffect(() => {
        isAppConfigurator(api).then(setAppConfigurator);
        isGlobalAdmin(api).then(setGlobalAdmin);
    }, [api]);

    const rowConfig = React.useCallback(
        (item: PackageModuleItem): RowConfig => ({
            selectable: isPackageItem(item),
        }),
        []
    );

    return (
        <React.Fragment>
            <ObjectsTable<PackageModuleItem>
                resetKey={`${resetKey}`}
                rows={rowsFiltered}
                rowConfig={rowConfig}
                columns={columns}
                details={details}
                actions={actions}
                onActionButtonClick={showImportFromWizardButton ? onActionButtonClick : undefined}
                forceSelectionColumn={presentation === "app"}
                filterComponents={filterComponents}
                selection={selection}
                onChange={updateTable}
                paginationOptions={paginationOptions}
                actionButtonLabel={actionButtonLabel}
                loading={loadingTable}
                childrenKeys={["packages"]}
            />

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            {packagesToDiff && (
                <PackagesDiffDialog
                    onClose={closePackageDiffDialog}
                    packages={packagesToDiff}
                    remoteStore={remoteStore}
                    remoteInstance={remoteInstance}
                />
            )}

            {packageSource && (
                <PackageImportDialog
                    isOpen={openImportPackageDialog}
                    onClose={handleCloseImportWizard}
                    instance={packageSource}
                    selectedPackagesId={toImportWizard}
                    openSyncSummary={handleOpenSyncSummaryFromDialog}
                />
            )}
        </React.Fragment>
    );
};

function mapPackagesToPackageItems(
    modules: Module[],
    packages: ListPackage[],
    importedPackages: ImportedPackage[],
    packageSource?: PackageSource
): PackageItem[] {
    const verifyIfPackageIsImported = (pkg: ListPackage) => {
        return importedPackages.some(imported => {
            const importedRevision = imported.version.split("-")[0];
            const importedTag = imported.version.split("-")[1] || "";

            const pkgRevision = pkg.version.split("-")[0];
            const pkgTag = pkg.version.split("-")[1] || "";

            return (
                imported.module.id === pkg.module.id &&
                importedRevision === pkgRevision &&
                importedTag === pkgTag &&
                imported.dhisVersion === pkg.dhisVersion
            );
        });
    };

    if (packageSource) {
        const listPackages = packages.map(pkg => {
            const installed = verifyIfPackageIsImported(pkg);

            const newUpdates = importedPackages.some(imported => {
                const importedVersion = semver.parse(imported.version);
                const packageVersion = semver.parse(pkg.version);

                return (
                    imported.module.id === pkg.module.id &&
                    importedVersion &&
                    packageVersion &&
                    imported.dhisVersion === pkg.dhisVersion &&
                    importedVersion < packageVersion
                );
            });

            const installStatus: InstallStatus = installed ? "Installed" : newUpdates ? "Upgrade" : "NotInstalled";

            return { ...pkg, installStatus };
        });

        return listPackages;
    } else {
        const listPackages = packages.map(pkg => {
            const isPackageImported = verifyIfPackageIsImported(pkg);

            const module = modules.find(module => module.id === pkg.module.id);

            const isPackageFromFile = module && module.autogenerated;

            const installed = !isPackageFromFile || (isPackageFromFile && isPackageImported);

            const installStatus: InstallStatus = installed ? "InstalledLocalPackage" : "NotInstalledLocalPackage";

            return { ...pkg, installStatus };
        });

        return listPackages;
    }
}
