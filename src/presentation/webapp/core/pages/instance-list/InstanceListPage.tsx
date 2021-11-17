import Icon from "@material-ui/core/Icon";
import DeleteIcon from "@material-ui/icons/Delete";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import EditIcon from "@material-ui/icons/Edit";
import SettingsInputAntenaIcon from "@material-ui/icons/SettingsInputAntenna";
import {
    ConfirmationDialog,
    MetaObject,
    ObjectsTable,
    ObjectsTableDetailField,
    RowConfig,
    ShareUpdate,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instance, InstanceData } from "../../../../../domain/instance/entities/Instance";
import { User } from "../../../../../domain/user/entities/User";
import i18n from "../../../../../locales";
import { executeAnalytics } from "../../../../../utils/analytics";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import { SharingDialog } from "../../../../react/core/components/sharing-dialog/SharingDialog";
import { TestWrapper } from "../../../../react/core/components/test-wrapper/TestWrapper";
import { useAppContext } from "../../../../react/core/contexts/AppContext";

const InstanceListPage = () => {
    const { api, compositionRoot } = useAppContext();
    const history = useHistory();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [loadingRows, setLoadingRows] = useState(true);
    const [rows, setRows] = useState<Instance[]>([]);
    const [search, changeSearch] = useState<string>("");
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [toDelete, deleteInstances] = useState<string[]>([]);
    const [sharingSettingsObject, setSharingSettingsObject] = useState<MetaObject | null>(null);
    const [user, setUser] = useState<User>();
    const [appStorage, setAppStorage] = useState<"dataStore" | "constant">();
    const [localInstance, setLocalInstance] = useState<Instance>();

    useEffect(() => {
        compositionRoot.user.current().then(setUser);
    }, [compositionRoot.user]);

    useEffect(() => {
        compositionRoot.instances.list({ search }).then(rows => {
            setRows(rows);
            setLoadingRows(false);
        });
    }, [compositionRoot, search, toDelete]);

    useEffect(() => {
        compositionRoot.config.getStorage().then(storage => setAppStorage(storage));
    }, [compositionRoot]);

    useEffect(() => {
        compositionRoot.instances.getLocal().then(setLocalInstance);
    }, [compositionRoot.instances]);

    const createInstance = () => {
        history.push("/instances/new");
    };

    const editInstance = async (ids: string[]) => {
        const instance = rows.find(row => row.id === ids[0]);
        if (instance?.type === "dhis" && user?.isAppConfigurator) {
            history.push(`/instances/edit/${instance.id}`);
        }
    };

    const replicateInstance = async (ids: string[]) => {
        const result = await compositionRoot.instances.getById(ids[0]);
        result.match({
            success: instance => {
                history.push({
                    pathname: "/instances/new",
                    state: { instance: instance.replicate() },
                });
            },
            error: () => {
                snackbar.error(i18n.t("Instance not found"));
            },
        });
    };

    const testConnection = async (ids: string[]) => {
        const result = await compositionRoot.instances.getById(ids[0]);
        await result.match({
            success: async instance => {
                const validation = await compositionRoot.instances.validate(instance);
                validation.match({
                    success: () => {
                        snackbar.success(i18n.t("Connected successfully to instance"));
                    },
                    error: error => {
                        snackbar.error(error, { autoHideDuration: null });
                    },
                });
            },
            error: async () => {
                snackbar.error(i18n.t("Instance not found"));
            },
        });
    };

    const runAnalytics = async (ids: string[]) => {
        const result = await compositionRoot.instances.getById(ids[0]);
        await result.match({
            success: async instance => {
                for await (const message of executeAnalytics(instance)) {
                    loading.show(true, message);
                }

                snackbar.info(i18n.t("Analytics execution finished on {{name}}", instance));
                loading.reset();
            },
            error: async () => {
                snackbar.error(i18n.t("Instance not found"));
            },
        });
    };

    const cancelDelete = () => {
        deleteInstances([]);
    };

    const confirmDelete = async () => {
        if (toDelete.length === 0) return;
        loading.show(true, i18n.t("Deleting Instances"));

        const results = [];
        for (const id of toDelete) {
            results.push(await compositionRoot.instances.delete(id));
        }

        loading.reset();
        updateSelection([]);
        deleteInstances([]);

        if (_.some(results, [false])) {
            snackbar.error(i18n.t("Failed to delete some instances"));
        } else {
            snackbar.success(i18n.t("Successfully deleted {{total}} instances", { total: toDelete.length }));
        }
    };

    const metadataMapping = async (ids: string[]) => {
        if (ids.length !== 1) return;
        history.push(`/instances/mapping/${ids[0]}`);
    };

    const backHome = () => {
        history.push("/dashboard");
    };

    const updateTable = (state: TableState<Instance>) => {
        const { selection } = state;
        updateSelection(selection);
    };

    const openSharingSettings = async (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;
        if (!localInstance) return;

        const instanceResult = await compositionRoot.instances.getById(id);

        instanceResult.match({
            success: instance => {
                if (!localInstance.existsShareSettingsInDataStore && appStorage === "dataStore") {
                    snackbar.warning(
                        i18n.t(
                            `Your current DHIS2 version is {{version}}. This version does not come with share settings in the data store and, in consequence, there are not sharing settings for each instance. This is a potential risk and we highly recommend you to update your DHIS2 version.`,
                            { version: localInstance.version }
                        )
                    );
                }

                setSharingSettingsObject({
                    object: instance.toObject(),
                    meta: { allowPublicAccess: true, allowExternalAccess: false },
                });
            },
            error: () => console.error("Instance not found"),
        });
    };

    const verifyUserCanEdit = (instances: Instance[]) => {
        if (!user) return false;

        return instances[0].hasPermissions("write", user);
    };

    const verifyUserCanRead = (instances: Instance[]) => {
        if (!user) return false;

        return instances[0].hasPermissions("read", user);
    };

    const columns: TableColumn<Instance>[] = [
        { name: "name" as const, text: i18n.t("Server name"), sortable: true },
        { name: "url" as const, text: i18n.t("URL endpoint"), sortable: false },
        {
            name: "username" as const,
            text: i18n.t("Username"),
            sortable: true,
            getValue: row => (row.type === "local" ? "Logged user" : row.username),
        },
    ];

    const details: ObjectsTableDetailField<Instance>[] = [
        { name: "name" as const, text: i18n.t("Server name") },
        { name: "url" as const, text: i18n.t("URL endpoint") },
        {
            name: "username" as const,
            text: i18n.t("Username"),
            getValue: row => (row.type === "local" ? "Logged user" : row.username),
        },
        { name: "description" as const, text: i18n.t("Description") },
        { name: "version" as const, text: i18n.t("Version") },
    ];

    const actions: TableAction<Instance>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
        {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            isActive: rows => verifyUserCanEdit(rows) && _.every(rows, row => row.type !== "local"),
            primary: true,
            onClick: editInstance,
            icon: <EditIcon />,
        },
        {
            name: "replicate",
            text: i18n.t("Replicate"),
            multiple: false,
            isActive: rows => verifyUserCanEdit(rows) && _.every(rows, row => row.type !== "local"),
            onClick: replicateInstance,
            icon: <Icon>content_copy</Icon>,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: true,
            isActive: rows => verifyUserCanEdit(rows) && _.every(rows, row => row.type !== "local"),
            onClick: deleteInstances,
            icon: <DeleteIcon />,
        },
        {
            name: "testConnection",
            text: i18n.t("Test Connection"),
            multiple: false,
            isActive: rows => _.every(rows, row => row.type !== "local") && verifyUserCanRead(rows),
            onClick: testConnection,
            icon: <SettingsInputAntenaIcon />,
        },
        {
            name: "runAnalytics",
            text: i18n.t("Run analytics"),
            multiple: false,
            onClick: runAnalytics,
            icon: <Icon>data_usage</Icon>,
            isActive: rows => process.env.NODE_ENV === "development" && verifyUserCanEdit(rows),
        },
        {
            name: "mapping",
            text: i18n.t("Metadata mapping"),
            multiple: false,
            isActive: verifyUserCanEdit,
            onClick: metadataMapping,
            icon: <DoubleArrowIcon />,
        },
        {
            name: "sharingSettings",
            text: i18n.t("Sharing settings"),
            multiple: false,
            isActive: verifyUserCanEdit,
            onClick: openSharingSettings,
            icon: <Icon>share</Icon>,
        },
    ];

    const rowConfig = React.useCallback(
        (instance: Instance): RowConfig => ({
            cellStyle: instance.type === "local" ? { fontWeight: "bold" } : undefined,
            selectable: instance.type !== "local",
        }),
        []
    );

    //TODO: create a use case for this api call
    const onSearchRequest = (key: string) => api.sharing.search({ key }).getData();

    const onSharingChanged = async (updatedAttributes: ShareUpdate) => {
        if (!sharingSettingsObject) return;

        const newSharingSettings = {
            meta: sharingSettingsObject.meta,
            object: {
                ...sharingSettingsObject.object,
                ...updatedAttributes,
            },
        };

        const instance = Instance.build(newSharingSettings.object as InstanceData);

        setSharingSettingsObject(newSharingSettings);

        compositionRoot.instances
            .save(instance)
            .then(validationErrors => {
                if (validationErrors.length > 0) {
                    console.error(validationErrors);
                    snackbar.error(i18n.t("An error has ocurred editing share settings"));
                }
            })
            .catch(error => {
                console.error(error);
                snackbar.error(i18n.t("An error has ocurred editing share settings"));
            });
    };

    return (
        <TestWrapper>
            <ConfirmationDialog
                isOpen={toDelete.length > 0}
                onSave={confirmDelete}
                onCancel={cancelDelete}
                title={i18n.t("Delete Instances?")}
                description={i18n.t("Are you sure you want to delete {{total}} instances?", {
                    total: toDelete.length,
                })}
                saveText={i18n.t("Ok")}
            />

            <PageHeader title={i18n.t("Instance Settings")} onBackClick={backHome} />

            <ObjectsTable<Instance>
                rows={rows}
                columns={columns}
                details={details}
                actions={actions}
                rowConfig={rowConfig}
                onActionButtonClick={user?.isAppConfigurator || false ? createInstance : undefined}
                onChangeSearch={changeSearch}
                selection={selection}
                onChange={updateTable}
                loading={loadingRows}
            />

            {!!sharingSettingsObject && (
                <SharingDialog
                    isOpen={true}
                    showOptions={{
                        title: false,
                        dataSharing: false,
                    }}
                    title={i18n.t("Sharing settings for {{name}}", sharingSettingsObject.object)}
                    meta={sharingSettingsObject}
                    onCancel={() => setSharingSettingsObject(null)}
                    onChange={onSharingChanged}
                    onSearch={onSearchRequest}
                />
            )}
        </TestWrapper>
    );
};

export default InstanceListPage;
