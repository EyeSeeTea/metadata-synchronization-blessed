import { Icon } from "@material-ui/core";
import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    MetaObject,
    ObjectsTable,
    ObjectsTableDetailField,
    ShareUpdate,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { generateUid } from "d2/uid";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Module } from "../../../../../domain/modules/entities/Module";
import { Package } from "../../../../../domain/packages/entities/Package";
import i18n from "../../../../../locales";
import { promiseMap } from "../../../../../utils/common";
import { getUserInfo, isGlobalAdmin, UserInfo } from "../../../../../utils/permissions";
import { ModulePackageListPageProps } from "../../../../webapp/core/pages/module-package-list/ModulePackageListPage";
import { useAppContext } from "../../contexts/AppContext";
import Dropdown from "../dropdown/Dropdown";
import {
    PullRequestCreation,
    PullRequestCreationDialog,
} from "../pull-request-creation-dialog/PullRequestCreationDialog";
import { SharingDialog } from "../sharing-dialog/SharingDialog";
import { NewPackageDialog } from "./NewPackageDialog";
import { getValidationsByVersionFeedback } from "./utils";

export const ModulesListTable: React.FC<ModulePackageListPageProps> = ({
    remoteInstance,
    onActionButtonClick,
    presentation = "app",
    externalComponents,
    openSyncSummary = _.noop,
    paginationOptions,
}) => {
    const { compositionRoot, api } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const history = useHistory();

    const [rows, setRows] = useState<Module[]>([]);
    const [selection, updateSelection] = useState<TableSelection[]>([]);

    const [resetKey, setResetKey] = useState(Math.random());
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [newPackageModule, setNewPackageModule] = useState<Module>();
    const [sharingSettingsObject, setSharingSettingsObject] = useState<MetaObject | null>(null);
    const [pullRequestProps, setPullRequestProps] = useState<PullRequestCreation>();
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState("");

    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo>();

    const editModule = useCallback(
        (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid module"));
            else history.push({ pathname: `/modules/edit/${item.id}`, state: { module: item } });
        },
        [rows, history, snackbar]
    );

    const downloadSnapshot = useCallback(
        async (ids: string[]) => {
            const module = _.find(rows, ({ id }) => id === ids[0]);
            if (!module) snackbar.error(i18n.t("Invalid module"));
            else {
                loading.show(true, i18n.t("Downloading snapshot for module {{name}}", module));

                const originInstance = remoteInstance?.id ?? "LOCAL";
                const contents = await compositionRoot.sync[module.type]({
                    ...module.toSyncBuilder(),
                    originInstance,
                    targetInstances: [],
                }).buildPayload();

                await compositionRoot.modules.download(module, contents);
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
                const validationsByVersion = _.fromPairs(
                    await promiseMap(versions, async dhisVersion => {
                        loading.show(
                            true,
                            i18n.t("Creating {{dhisVersion}} package for module {{name}}", {
                                name: module.name,
                                dhisVersion,
                            })
                        );

                        const validations = await compositionRoot.packages.create(
                            remoteInstance?.id ?? "LOCAL",
                            item.update({ id: generateUid() }),
                            module,
                            dhisVersion
                        );

                        return [dhisVersion, validations];
                    })
                );

                const [level, msg] = getValidationsByVersionFeedback(module, validationsByVersion);
                snackbar.openSnackbar(level, msg);

                loading.reset();
                setResetKey(Math.random());
            }
        },
        [compositionRoot, remoteInstance, rows, snackbar, loading]
    );

    const pullModule = useCallback(
        async (ids: string[]) => {
            const module = _.find(rows, ({ id }) => id === ids[0]);
            if (!module) snackbar.error(i18n.t("Invalid module"));
            else {
                loading.show(true, i18n.t("Pulling metadata from module {{name}}", module));

                const originInstance = remoteInstance?.id ?? "LOCAL";
                const builder = {
                    ...module.toSyncBuilder(),
                    originInstance,
                    targetInstances: ["LOCAL"],
                };

                const result = await compositionRoot.sync.prepare(module.type, builder);
                const sync = compositionRoot.sync[module.type](builder);

                const createPullRequest = () => {
                    if (!remoteInstance) {
                        snackbar.error(i18n.t("Unable to create pull request"));
                    } else {
                        setPullRequestProps({
                            instance: remoteInstance,
                            builder,
                            type: module.type,
                        });
                    }
                };

                const synchronize = async () => {
                    for await (const { message, syncReport, done } of sync.execute()) {
                        if (message) loading.show(true, message);
                        if (syncReport) await compositionRoot.reports.save(syncReport);
                        if (done) {
                            openSyncSummary(syncReport);
                            return;
                        }
                    }
                };

                await result.match({
                    success: async () => {
                        await synchronize();
                    },
                    error: async code => {
                        switch (code) {
                            case "PULL_REQUEST":
                                createPullRequest();
                                break;
                            case "PULL_REQUEST_RESPONSIBLE":
                                updateDialog({
                                    title: i18n.t("Pull metadata"),
                                    description: i18n.t(
                                        "You are one of the reponsibles for the selected items.\nDo you want to directly pull the metadata?"
                                    ),
                                    onCancel: () => {
                                        updateDialog(null);
                                    },
                                    onSave: async () => {
                                        updateDialog(null);
                                        await synchronize();
                                    },
                                    onInfoAction: () => {
                                        updateDialog(null);
                                        createPullRequest();
                                    },
                                    cancelText: i18n.t("Cancel"),
                                    saveText: i18n.t("Proceed"),
                                    infoActionText: i18n.t("Create pull request"),
                                });
                                break;
                            case "INSTANCE_NOT_FOUND":
                                snackbar.warning(i18n.t("Couldn't connect with instance"));
                                break;
                            case "NOT_AUTHORIZED":
                                snackbar.error(
                                    i18n.t(
                                        "You do not have the authority to one or multiple target instances of the sync rule"
                                    )
                                );
                                break;
                            default:
                                snackbar.error(i18n.t("Unknown synchronization error"));
                        }
                    },
                });

                loading.reset();
            }
        },
        [compositionRoot, openSyncSummary, remoteInstance, loading, rows, snackbar]
    );

    const replicateModule = useCallback(
        async (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) {
                snackbar.error(i18n.t("Invalid module"));
                return;
            }

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
                await compositionRoot.modules.delete(id);
            }
            loading.reset();
            setResetKey(Math.random());
            updateSelection([]);
        },
        [compositionRoot, loading]
    );

    const openSharingSettings = useCallback(
        async (ids: string[]) => {
            const module = _.find(rows, ({ id }) => id === ids[0]);
            if (!module) {
                snackbar.error(i18n.t("Invalid module"));
                return;
            }

            setSharingSettingsObject({
                object: module,
                meta: { allowPublicAccess: true, allowExternalAccess: false },
            });
        },
        [rows, snackbar]
    );

    const updateTable = useCallback(
        ({ selection }: TableState<Module>) => {
            updateSelection(selection);
        },
        [updateSelection]
    );

    const verifyUserHasWritePermissions = useCallback(
        (modules: Module[]) => {
            if (globalAdmin) return true;

            for (const module of modules) {
                if (!!userInfo && !module.hasPermissions("write", userInfo.id, userInfo.userGroups)) return false;
            }

            return true;
        },
        [globalAdmin, userInfo]
    );

    const columns: TableColumn<Module>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name"), sortable: true },
            {
                name: "department",
                text: i18n.t("Department"),
                sortable: true,
                getValue: ({ department }) => {
                    return department.name;
                },
            },
            { name: "description", text: i18n.t("Description"), sortable: true, hidden: true },
            {
                name: "metadataIds",
                text: "Selected metadata",
                getValue: module => `${module.metadataIds.length} elements`,
            },
            { name: "lastUpdated", text: i18n.t("Last updated"), hidden: true },
            { name: "lastUpdatedBy", text: i18n.t("Last updated by"), hidden: true },
            { name: "created", text: i18n.t("Created"), hidden: true },
            { name: "user", text: i18n.t("Created by"), hidden: true },
        ],
        []
    );

    const details: ObjectsTableDetailField<Module>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            {
                name: "department",
                text: i18n.t("Department"),
                getValue: ({ department }) => {
                    return department.name;
                },
            },
            { name: "description", text: i18n.t("Description") },
            {
                name: "metadataIds",
                text: i18n.t("Selected metadata"),
                getValue: module => `${module.metadataIds.length} elements`,
            },
            { name: "lastUpdated", text: i18n.t("Last updated") },
            { name: "lastUpdatedBy", text: i18n.t("Last updated by") },
            { name: "created", text: i18n.t("Created") },
            { name: "user", text: i18n.t("Created by") },
        ],
        []
    );

    const actions: TableAction<Module>[] = useMemo(
        () => [
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
                isActive: modules =>
                    presentation === "app" && !remoteInstance && verifyUserHasWritePermissions(modules),
                onClick: editModule,
                primary: presentation === "app" && !remoteInstance,
                icon: <Icon>edit</Icon>,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                isActive: modules =>
                    presentation === "app" && !remoteInstance && verifyUserHasWritePermissions(modules),
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
                text: i18n.t("Download metadata package"),
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
            {
                name: "pull-metadata",
                text: i18n.t("Pull metadata"),
                multiple: false,
                icon: <Icon>arrow_downward</Icon>,
                isActive: () => presentation === "app" && !!remoteInstance,
                onClick: pullModule,
            },
            {
                name: "sharingSettings",
                text: i18n.t("Sharing settings"),
                multiple: false,
                isActive: verifyUserHasWritePermissions,
                onClick: openSharingSettings,
                icon: <Icon>share</Icon>,
            },
        ],
        [
            createPackage,
            deleteModule,
            downloadSnapshot,
            editModule,
            openSharingSettings,
            presentation,
            pullModule,
            remoteInstance,
            replicateModule,
            verifyUserHasWritePermissions,
        ]
    );

    const departmentFilterItems = useMemo(() => {
        return _(rows)
            .map(({ department }) => department)
            .uniqBy(({ id }) => id)
            .sortBy(({ name }) => name)
            .value();
    }, [rows]);

    const filterComponents = useMemo(() => {
        const departmentFilterComponent = (
            <Dropdown
                key="filter-department"
                items={departmentFilterItems}
                onValueChange={setDepartmentFilter}
                value={departmentFilter}
                label={i18n.t("Department")}
            />
        );

        return [externalComponents, departmentFilterComponent];
    }, [externalComponents, departmentFilter, departmentFilterItems]);

    const rowsFiltered = useMemo(() => {
        return departmentFilter ? rows.filter(({ department }) => department.id === departmentFilter) : rows;
    }, [departmentFilter, rows]);

    const onSearchRequest = useCallback((key: string) => api.sharing.search({ key }).getData(), [api]);

    const onSharingChanged = useCallback(
        async (updatedAttributes: ShareUpdate) => {
            if (!sharingSettingsObject) return;

            const module = (sharingSettingsObject.object as Module).update(updatedAttributes);

            await compositionRoot.modules.save(module);
            setSharingSettingsObject({
                meta: sharingSettingsObject.meta,
                object: module,
            });
        },
        [sharingSettingsObject, compositionRoot]
    );

    const closeSharingSettingsDialog = useCallback(() => {
        setSharingSettingsObject(null);
        setResetKey(Math.random());
    }, []);

    useEffect(() => {
        setIsTableLoading(true);
        compositionRoot.modules
            .list(globalAdmin, remoteInstance)
            .then(rows => {
                setRows(rows);
                setIsTableLoading(false);
            })
            .catch((error: Error) => {
                snackbar.error(error.message);
                setRows([]);
                setIsTableLoading(false);
            });
    }, [compositionRoot, remoteInstance, resetKey, snackbar, setIsTableLoading, globalAdmin]);

    useEffect(() => {
        setDepartmentFilter("");
    }, [remoteInstance]);

    useEffect(() => {
        isGlobalAdmin(api).then(setGlobalAdmin);
        getUserInfo(api).then(setUserInfo);
    }, [api]);

    return (
        <React.Fragment>
            <ObjectsTable<Module>
                rows={rowsFiltered}
                loading={isTableLoading}
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

            {!!newPackageModule && (
                <NewPackageDialog
                    save={savePackage}
                    close={() => setNewPackageModule(undefined)}
                    module={newPackageModule}
                />
            )}

            {!!pullRequestProps && (
                <PullRequestCreationDialog {...pullRequestProps} onClose={() => setPullRequestProps(undefined)} />
            )}

            {!!sharingSettingsObject && (
                <SharingDialog
                    isOpen={true}
                    showOptions={{
                        title: false,
                        dataSharing: false,
                    }}
                    title={i18n.t("Sharing settings for {{name}}", sharingSettingsObject.object)}
                    meta={sharingSettingsObject}
                    onCancel={closeSharingSettingsDialog}
                    onChange={onSharingChanged}
                    onSearch={onSearchRequest}
                    //@ts-ignore FIXME: Update d2-ui-components to make object generic extending ShareableObject
                    unremovebleIds={new Set([sharingSettingsObject.object.department.id])}
                />
            )}

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}
        </React.Fragment>
    );
};
