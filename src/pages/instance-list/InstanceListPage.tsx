import i18n from "@dhis2/d2-i18n";
import Icon from "@material-ui/core/Icon";
import DeleteIcon from "@material-ui/icons/Delete";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import EditIcon from "@material-ui/icons/Edit";
import SettingsInputAntenaIcon from "@material-ui/icons/SettingsInputAntenna";
import { useD2 } from "d2-api";
import {
    ConfirmationDialog,
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
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import Instance, { InstanceData } from "../../models/instance";
import { D2 } from "../../types/d2";
import { isAppConfigurator } from "../../utils/permissions";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";

const InstanceListPage = () => {
    const d2 = useD2();
    const history = useHistory();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [rows, setRows] = useState<InstanceData[]>([]);
    const [search, changeSearch] = useState<string>("");
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [toDelete, deleteInstances] = useState<string[]>([]);
    const [appConfigurator, setAppConfigurator] = useState(false);

    useEffect(() => {
        isAppConfigurator(d2 as D2).then(setAppConfigurator);
    }, [d2]);

    useEffect(() => {
        Instance.list(d2 as D2, { search }, {}).then(({ objects }) => setRows(objects));
    }, [d2, search, toDelete]);

    const createInstance = () => {
        history.push("/instances/new");
    };

    const editInstance = (ids: string[]) => {
        if (ids.length !== 1) return;
        if (appConfigurator) history.push(`/instances/edit/${ids[0]}`);
    };

    const replicateInstance = async (ids: string[]) => {
        if (ids.length !== 1) return;
        const instance = await Instance.get(d2 as D2, ids[0]);
        if (instance) {
            history.push({
                pathname: "/instances/new",
                state: { instance: instance.replicate() },
            });
        }
    };

    const testConnection = async (ids: string[]) => {
        if (ids.length !== 1) return;
        const instance = await Instance.get(d2 as D2, ids[0]);
        const connectionErrors = await instance?.check();
        if (!connectionErrors || !connectionErrors.status) {
            snackbar.error(connectionErrors?.error?.message ?? "Unknown error", {
                autoHideDuration: null,
            });
        } else {
            snackbar.success(i18n.t("Connected successfully to instance"));
        }
    };

    const cancelDelete = () => {
        deleteInstances([]);
    };

    const confirmDelete = async () => {
        if (toDelete.length === 0) return;
        loading.show(true, i18n.t("Deleting Instances"));

        const results = [];
        for (const id of toDelete) {
            const instance = await Instance.get(d2 as D2, id);
            if (instance) results.push(await instance.remove(d2 as D2));
        }

        loading.reset();
        updateSelection((prevSelection: TableSelection[]) =>
            _.differenceBy(prevSelection, toDelete, "id")
        );
        deleteInstances([]);

        if (_.some(results, ["status", false])) {
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

    const updateTable = (state: TableState<InstanceData>) => {
        const { selection } = state;
        updateSelection(selection);
    };

    const columns: TableColumn<InstanceData>[] = [
        { name: "name" as const, text: i18n.t("Server name"), sortable: true },
        { name: "url" as const, text: i18n.t("URL endpoint"), sortable: false },
        { name: "username" as const, text: i18n.t("Username"), sortable: true },
    ];

    const details: ObjectsTableDetailField<InstanceData>[] = [
        { name: "name" as const, text: i18n.t("Server name") },
        { name: "url" as const, text: i18n.t("URL endpoint") },
        { name: "username" as const, text: i18n.t("Username") },
        { name: "description" as const, text: i18n.t("Description") },
    ];

    const actions: TableAction<InstanceData>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
        {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            isActive: () => appConfigurator,
            primary: true,
            onClick: editInstance,
            icon: <EditIcon />,
        },
        {
            name: "replicate",
            text: i18n.t("Replicate"),
            multiple: false,
            onClick: replicateInstance,
            icon: <Icon>content_copy</Icon>,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: true,
            isActive: () => appConfigurator,
            onClick: deleteInstances,
            icon: <DeleteIcon />,
        },
        {
            name: "testConnection",
            text: i18n.t("Test Connection"),
            multiple: false,
            onClick: testConnection,
            icon: <SettingsInputAntenaIcon />,
        },
        {
            name: "mapping",
            text: i18n.t("Metadata mapping"),
            multiple: false,
            onClick: metadataMapping,
            icon: <DoubleArrowIcon />,
        },
    ];

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

            <PageHeader title={i18n.t("Destination Instance Settings")} onBackClick={backHome} />

            <ObjectsTable<InstanceData>
                rows={rows}
                columns={columns}
                details={details}
                actions={actions}
                onActionButtonClick={appConfigurator ? createInstance : undefined}
                onChangeSearch={changeSearch}
                selection={selection}
                onChange={updateTable}
            />
        </TestWrapper>
    );
};

export default InstanceListPage;
