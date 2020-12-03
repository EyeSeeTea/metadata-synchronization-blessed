import Icon from "@material-ui/core/Icon";
import DeleteIcon from "@material-ui/icons/Delete";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import EditIcon from "@material-ui/icons/Edit";
import SettingsInputAntenaIcon from "@material-ui/icons/SettingsInputAntenna";
import {
    ConfirmationDialog,
    ObjectsTable,
    ObjectsTableDetailField,
    RowConfig,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import i18n from "../../../../../locales";
import { executeAnalytics } from "../../../../../utils/analytics";
import { isAppConfigurator } from "../../../../../utils/permissions";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import { TestWrapper } from "../../../../react/core/components/test-wrapper/TestWrapper";

const InstanceListPage = () => {
    const { api, compositionRoot } = useAppContext();
    const history = useHistory();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [rows, setRows] = useState<Instance[]>([]);
    const [search, changeSearch] = useState<string>("");
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [toDelete, deleteInstances] = useState<string[]>([]);
    const [appConfigurator, setAppConfigurator] = useState(false);

    useEffect(() => {
        isAppConfigurator(api).then(setAppConfigurator);
    }, [api]);

    useEffect(() => {
        compositionRoot.instances.list({ search }).then(setRows);
    }, [compositionRoot, search, toDelete]);

    const createInstance = () => {
        history.push("/instances/new");
    };

    const editInstance = async (ids: string[]) => {
        const instance = rows.find(row => row.id === ids[0]);
        if (instance?.type === "dhis" && appConfigurator) {
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
        result.match({
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
            error: () => {
                snackbar.error(i18n.t("Instance not found"));
            },
        });
    };

    const runAnalytics = async (ids: string[]) => {
        const result = await compositionRoot.instances.getById(ids[0]);
        result.match({
            success: async instance => {
                for await (const message of executeAnalytics(instance)) {
                    loading.show(true, message);
                }

                snackbar.info(i18n.t("Analytics execution finished on {{name}}", instance));
                loading.reset();
            },
            error: () => {
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
            snackbar.success(
                i18n.t("Successfully deleted {{count}} instances", { count: toDelete.length })
            );
        }
    };

    const metadataMapping = async (ids: string[]) => {
        if (ids.length !== 1) return;
        history.push(`/instances/mapping/${ids[0]}`);
    };

    const backHome = () => {
        history.push("/");
    };

    const updateTable = (state: TableState<Instance>) => {
        const { selection } = state;
        updateSelection(selection);
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
            isActive: rows => appConfigurator && _.every(rows, row => row.type !== "local"),
            primary: true,
            onClick: editInstance,
            icon: <EditIcon />,
        },
        {
            name: "replicate",
            text: i18n.t("Replicate"),
            multiple: false,
            isActive: rows => appConfigurator && _.every(rows, row => row.type !== "local"),
            onClick: replicateInstance,
            icon: <Icon>content_copy</Icon>,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: true,
            isActive: rows => appConfigurator && _.every(rows, row => row.type !== "local"),
            onClick: deleteInstances,
            icon: <DeleteIcon />,
        },
        {
            name: "testConnection",
            text: i18n.t("Test Connection"),
            multiple: false,
            isActive: rows => _.every(rows, row => row.type !== "local"),
            onClick: testConnection,
            icon: <SettingsInputAntenaIcon />,
        },
        {
            name: "runAnalytics",
            text: i18n.t("Run analytics"),
            multiple: false,
            onClick: runAnalytics,
            icon: <Icon>data_usage</Icon>,
            isActive: () => process.env.NODE_ENV === "development",
        },
        {
            name: "mapping",
            text: i18n.t("Metadata mapping"),
            multiple: false,
            onClick: metadataMapping,
            icon: <DoubleArrowIcon />,
        },
    ];

    const rowConfig = React.useCallback(
        (instance: Instance): RowConfig => ({
            cellStyle: instance.type === "local" ? { fontWeight: "bold" } : undefined,
            selectable: instance.type !== "local",
        }),
        []
    );

    return (
        <TestWrapper>
            <ConfirmationDialog
                isOpen={toDelete.length > 0}
                onSave={confirmDelete}
                onCancel={cancelDelete}
                title={i18n.t("Delete Instances?")}
                description={i18n.t("Are you sure you want to delete {{count}} instances?", {
                    count: toDelete.length,
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
                onActionButtonClick={appConfigurator ? createInstance : undefined}
                onChangeSearch={changeSearch}
                selection={selection}
                onChange={updateTable}
            />
        </TestWrapper>
    );
};

export default InstanceListPage;
