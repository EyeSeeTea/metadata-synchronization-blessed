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
import { BasePackage, Package } from "../../../../domain/packages/entities/Package";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { isAppConfigurator, isGlobalAdmin } from "../../../../utils/permissions";
import Dropdown from "../dropdown/Dropdown";
import { PackagesDiffDialog, PackageToDiff } from "../packages-diff-dialog/PackagesDiffDialog";
import { ModulePackageListPageProps } from "../../../webapp/pages/module-package-list/ModulePackageListPage";
import { useAppContext } from "../../contexts/AppContext";
import { ImportedPackage } from "../../../../domain/package-import/entities/ImportedPackage";
import semver from "semver";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { Store } from "../../../../domain/packages/entities/Store";
import { NamedRef } from "../../../../domain/common/entities/Ref";
import {
    isInstance,
    isStore,
    PackageSource,
} from "../../../../domain/package-import/entities/PackageSource";
import { mapToImportedPackage } from "../../../../domain/package-import/mappers/ImportedPackageMapper";
import { Either } from "../../../../domain/common/entities/Either";

type InstallState = "Installed" | "NotInstalled" | "Upgrade" | "Local";
type ListPackage = Omit<BasePackage, "contents"> & { installState: InstallState };

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
    resetKeyEx,
    actionButtonLabel,
}) => {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [instancePackages, setInstancePackages] = useState<ListPackage[]>([]);
    const [storePackages, setStorePackages] = useState<ListPackage[]>([]);
    const [importedPackages, setImportedPackages] = useState<ImportedPackage[]>([]);
    const rows = remoteStore ? storePackages : instancePackages;

    const [resetKey, setResetKey] = useState(resetKeyEx || Math.random());
    const [selection, updateSelection] = useState<TableSelection[]>(
        selectedIds?.map(id => ({ id })) || []
    );

    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [packageToDiff, setPackageToDiff] = useState<PackageToDiff | null>(null);
    const [moduleFilter, setModuleFilter] = useState("");
    const [dhis2VersionFilter, setDhis2VersionFilter] = useState("");
    const [localDhis2Version, setLocalDhis2Version] = useState("");
    const [installStateFilter, setInstallStateFilter] = useState("");

    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [appConfigurator, setAppConfigurator] = useState(false);
    const [loadingTable, setLoadingTable] = useState(true);

    const isRemoteInstance = !!remoteInstance;

    useEffect(() => {
        if (resetKeyEx) setResetKey(resetKeyEx);
    }, [resetKeyEx]);

    useEffect(() => {
        api.getVersion().then(setLocalDhis2Version);
    }, [api]);

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

            if (onSelectionChange) {
                const selectedIds = selection.map(selection => selection.id);
                onSelectionChange(selectedIds);
            }
        },
        [updateSelection, onSelectionChange]
    );

    const downloadPackage = useCallback(
        async (ids: string[]) => {
            try {
                compositionRoot.packages.download(remoteStore?.id, ids[0], remoteInstance);
            } catch (error) {
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

    const saveImportedPackage = useCallback(
        async (
            pkg: Package,
            author: NamedRef,
            packageSource: PackageSource,
            storePackageUrl?: string
        ) => {
            const importedPackage = mapToImportedPackage(
                pkg,
                author,
                packageSource,
                storePackageUrl
            );

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
        (
            packageSource: PackageSource,
            packageId: string
        ): Promise<Either<"NOT_FOUND", Package>> => {
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

    const importPackage = useCallback(
        async (ids: string[]) => {
            const packageSource: PackageSource = getPackageSourceToImport();

            const result = await getPackage(packageSource, ids[0]);

            result.match({
                success: async originPackage => {
                    try {
                        loading.show(
                            true,
                            i18n.t("Importing package {{name}}", { name: originPackage.name })
                        );
                        const result = await compositionRoot.metadata.import(
                            originPackage.contents
                        );

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

                        if (result.status === "SUCCESS") {
                            const currentUser = await api.currentUser
                                .get({ fields: { id: true, userCredentials: { username: true } } })
                                .getData();

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
                        setResetKey(Math.random);
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

    const getInstallStateText = (installState: InstallState) => {
        switch (installState) {
            case "Installed":
                return i18n.t("Installed");
            case "NotInstalled":
                return i18n.t("Not Installed");
            case "Upgrade":
                return i18n.t("Upgrade Available");
            case "Local":
                return "";
        }
    };

    const columns: TableColumn<ListPackage>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name"), sortable: true },
            { name: "description", text: i18n.t("Description"), sortable: true, hidden: true },
            { name: "version", text: i18n.t("Version"), sortable: true },
            { name: "dhisVersion", text: i18n.t("DHIS2 Version"), sortable: true },
            { name: "module", text: i18n.t("Module"), sortable: true },
            { name: "created", text: i18n.t("Created"), sortable: true, hidden: true },
            { name: "user", text: i18n.t("Created by"), sortable: true, hidden: true },
            {
                name: "installState",
                text: i18n.t("State"),
                sortable: true,
                hidden: !remoteInstance && !remoteStore,
                getValue: (row: ListPackage) => getInstallStateText(row.installState),
            },
        ],
        [remoteInstance, remoteStore]
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
            {
                name: "installState",
                text: i18n.t("State"),
                getValue: (row: ListPackage) => getInstallStateText(row.installState),
            },
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
            },
            {
                name: "publish",
                text: i18n.t("Publish to Store"),
                multiple: false,
                onClick: publishPackage,
                icon: <Icon>publish</Icon>,
                isActive: () =>
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
                isActive: () =>
                    presentation === "app" &&
                    (isRemoteInstance || remoteStore !== undefined) &&
                    appConfigurator,
                onClick: openPackageDiffDialog,
            },
            {
                name: "import",
                text: i18n.t("Import package"),
                multiple: false,
                onClick: importPackage,
                icon: <Icon>arrow_downward</Icon>,
                isActive: () =>
                    !isImportDialog &&
                    presentation === "app" &&
                    (isRemoteInstance || remoteStore !== undefined) &&
                    appConfigurator,
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
            remoteStore,
            isImportDialog,
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

    const installStateFilterItems = useMemo(() => {
        const packages = remoteStore ? storePackages : instancePackages;

        return _(packages)
            .map(pkg => ({
                id: pkg.installState,
                name: getInstallStateText(pkg.installState),
            }))
            .uniqBy(({ id }) => id)
            .sortBy(({ name }) => name)
            .value();
    }, [instancePackages, storePackages, remoteStore]);

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

        const dhis2VersionFilterComponent = (
            <Dropdown
                key="filter-dhis2-version"
                items={dhis2VersionFilterItems}
                onValueChange={setDhis2VersionFilter}
                value={dhis2VersionFilter}
                label={i18n.t("Dhis2 version")}
            />
        );

        const installStateFilterComponent =
            remoteInstance || remoteStore ? (
                <Dropdown
                    key="filter-install-state"
                    items={installStateFilterItems}
                    onValueChange={setInstallStateFilter}
                    value={installStateFilter}
                    label={i18n.t("State")}
                />
            ) : null;
        return [
            externalComponents,
            moduleFilterComponent,
            dhis2VersionFilterComponent,
            installStateFilterComponent,
        ];
    }, [
        externalComponents,
        moduleFilter,
        moduleFilterItems,
        dhis2VersionFilterItems,
        dhis2VersionFilter,
        installStateFilterItems,
        installStateFilter,
        remoteInstance,
        remoteStore,
    ]);

    const rowsFiltered = useMemo(() => {
        setLoadingTable(false);
        return rows.filter(
            row =>
                (row.module.id === moduleFilter || !moduleFilter) &&
                (row.dhisVersion === dhis2VersionFilter || !dhis2VersionFilter) &&
                (row.installState === installStateFilter || !installStateFilter)
        );
    }, [moduleFilter, rows, dhis2VersionFilter, installStateFilter]);

    useEffect(() => {
        setLoadingTable(true);
        compositionRoot.packages
            .list(globalAdmin, remoteInstance)
            .then(packages => {
                setInstancePackages(
                    mapPackagesToListPackages(
                        packages,
                        importedPackages,
                        remoteInstance,
                        remoteStore
                    )
                );
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
    ]);

    useEffect(() => {
        if (remoteStore) {
            setLoadingTable(true);
            compositionRoot.packages.listStore(remoteStore.id).then(validation => {
                validation.match({
                    success: packages => {
                        setStorePackages(
                            mapPackagesToListPackages(
                                packages,
                                importedPackages,
                                remoteInstance,
                                remoteStore
                            )
                        );
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
    }, [compositionRoot, snackbar, remoteStore, importedPackages, remoteInstance, resetKey]);

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
    }, [remoteInstance]);

    useEffect(() => {
        isAppConfigurator(api).then(setAppConfigurator);
        isGlobalAdmin(api).then(setGlobalAdmin);
    }, [api]);

    const showImportFromWizardButton =
        !isImportDialog &&
        presentation === "app" &&
        (isRemoteInstance || remoteStore) &&
        appConfigurator;

    return (
        <React.Fragment>
            <ObjectsTable<ListPackage>
                rows={rowsFiltered}
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
            />

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            {packageToDiff && (
                <PackagesDiffDialog
                    onClose={closePackageDiffDialog}
                    remotePackage={packageToDiff}
                    remoteStore={remoteStore}
                    remoteInstance={remoteInstance}
                />
            )}
        </React.Fragment>
    );
};

function mapPackagesToListPackages(
    packages: BasePackage[],
    importedPackages: ImportedPackage[],
    remoteInstance?: Instance,
    remoteStore?: Store
): ListPackage[] {
    const listPackages = packages.map(pkg => {
        if (!remoteStore && !remoteInstance)
            return { ...pkg, installState: "Local" as InstallState };

        const installed = importedPackages.some(imported => {
            return (
                (remoteStore && imported.url === pkg.id) ||
                (remoteInstance && imported.package.id === pkg.id)
            );
        });

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

        const installState: InstallState = installed
            ? "Installed"
            : newUpdates
            ? "Upgrade"
            : "NotInstalled";

        return { ...pkg, installState };
    });

    return listPackages;
}
