import { Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import DescriptionIcon from "@material-ui/icons/Description";
import {
    ConfirmationDialog,
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    TablePagination,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SynchronizationReport } from "../../../../../domain/reports/entities/SynchronizationReport";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import { SynchronizationType } from "../../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../../locales";
import { promiseMap } from "../../../../../utils/common";
import { getValueForCollection } from "../../../../../utils/d2-ui-components";
import { isAppConfigurator } from "../../../../../utils/permissions";
import Dropdown from "../../../../react/core/components/dropdown/Dropdown";
import SyncSummary, { formatStatusTag } from "../../../../react/core/components/sync-summary/SyncSummary";
import { useAppContext } from "../../../../react/core/contexts/AppContext";

const dropdownItems = [
    {
        id: "READY",
        name: i18n.t("Ready"),
    },
    {
        id: "RUNNING",
        name: i18n.t("Running"),
    },
    {
        id: "FAILURE",
        name: i18n.t("Failure"),
    },
    {
        id: "DONE",
        name: i18n.t("Done"),
    },
];

const initialState = {
    sorting: { field: "date" as const, order: "desc" as const },
    pagination: { pageSize: 25, page: 1, total: 0 },
};

export interface HistoryTableProps {
    types: SynchronizationType[];
    id?: string;
}

export const HistoryTable: React.FC<HistoryTableProps> = React.memo(props => {
    const { types, id } = props;

    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [syncRules, setSyncRules] = useState<SynchronizationRule[]>([]);
    const [syncReport, setSyncReport] = useState<SynchronizationReport>();
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [response, updateResponse] = useState<{
        rows: SynchronizationReport[];
        pager: Partial<TablePagination>;
    }>({ rows: [], pager: initialState.pagination });
    const [appConfigurator, setAppConfigurator] = useState(false);

    const [statusFilter, updateStatusFilter] = useState("");
    const [syncRuleFilter, updateSyncRuleFilter] = useState("");

    const updateTable = useCallback(
        (tableState?: TableState<SynchronizationReport>) => {
            updateResponse({ rows: [], pager: {} });
            updateSelection(oldSelection => tableState?.selection ?? oldSelection);

            const { pagination, sorting } = tableState ?? initialState;
            compositionRoot.reports
                .list({
                    paging: true,
                    pageSize: pagination.pageSize,
                    page: pagination.page,
                    sorting,
                    filters: { types, statusFilter, syncRuleFilter },
                })
                .then(updateResponse);
        },
        [statusFilter, syncRuleFilter, types, compositionRoot]
    );

    useEffect(() => {
        compositionRoot.rules.list({ filters: { types }, paging: false }).then(({ rows }) => setSyncRules(rows));

        if (id) compositionRoot.reports.get(id).then(setSyncReport);

        isAppConfigurator(api).then(setAppConfigurator);
    }, [api, id, types, compositionRoot]);

    useEffect(() => {
        updateTable();
    }, [updateTable, toDelete]);

    const columns: TableColumn<SynchronizationReport>[] = [
        {
            name: "syncRule",
            text: i18n.t("Sync Rule"),
            sortable: true,
            getValue: ({ syncRule: id, deletedSyncRuleLabel, packageImport }) => {
                return packageImport
                    ? i18n.t("(package import)")
                    : deletedSyncRuleLabel ?? _.find(syncRules, { id })?.name ?? i18n.t("(manual synchronization)");
            },
        },
        {
            name: "type",
            text: i18n.t("Type"),
            sortable: true,
            getValue: ({ type }) => _.startCase(type),
            hidden: types.length === 1,
        },
        { name: "date", text: i18n.t("Timestamp"), sortable: true },
        {
            name: "status",
            text: i18n.t("Status"),
            sortable: true,
            getValue: ({ status }) => formatStatusTag(status),
        },
        { name: "user", text: i18n.t("User"), sortable: true },
    ];

    const details: ObjectsTableDetailField<SynchronizationReport>[] = [
        { name: "user", text: i18n.t("User") },
        { name: "date", text: i18n.t("Timestamp") },
        {
            name: "status",
            text: i18n.t("Status"),
            getValue: notification => _.startCase(_.toLower(notification.status)),
        },
        {
            name: "types",
            text: i18n.t("Metadata Types"),
            getValue: notification => getValueForCollection(notification.types.map(type => ({ name: type }))),
        },
        {
            name: "syncRule",
            text: i18n.t("Sync Rule"),
            getValue: ({ syncRule: id, deletedSyncRuleLabel }) => {
                if (deletedSyncRuleLabel) {
                    return <Typography>{deletedSyncRuleLabel}</Typography>;
                } else {
                    const syncRule = syncRules.find(e => e.id === id);
                    if (!appConfigurator || !syncRule) return null;

                    return (
                        <Link to={`/sync-rules/${syncRule.type}/edit/${syncRule.id}`} target="_blank">
                            {i18n.t("Edit {{name}}", syncRule)}
                        </Link>
                    );
                }
            },
        },
    ];

    const verifyUserCanConfigure = () => {
        return appConfigurator;
    };

    const openSummary = (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;

        const item = _.find(response.rows, ["id", id]);
        if (item) setSyncReport(SynchronizationReport.build(item));
    };

    const actions: TableAction<SynchronizationReport>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            isActive: verifyUserCanConfigure,
            icon: <DeleteIcon />,
            multiple: true,
            onClick: setToDelete,
        },
        {
            name: "summary",
            text: i18n.t("View summary"),
            icon: <DescriptionIcon />,
            multiple: false,
            primary: true,
            onClick: openSummary,
        },
    ];

    const confirmDelete = async () => {
        loading.show(true, i18n.t("Deleting History Notifications"));

        await promiseMap(toDelete, id => compositionRoot.reports.delete(id));

        loading.reset();

        snackbar.success(
            i18n.t("Successfully deleted {{total}} history notifications", {
                total: toDelete.length,
            })
        );

        updateSelection([]);
        setToDelete([]);
    };

    const customFilters = (
        <React.Fragment>
            <Dropdown
                key={"level-filter"}
                items={dropdownItems}
                onValueChange={updateStatusFilter}
                value={statusFilter}
                label={i18n.t("Synchronization status")}
            />
            <Dropdown
                key={"sync-rule-filter"}
                items={syncRules}
                onValueChange={updateSyncRuleFilter}
                value={syncRuleFilter}
                label={i18n.t("Sync Rule")}
            />
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <ObjectsTable<SynchronizationReport>
                rows={response.rows}
                columns={columns}
                details={details}
                initialState={{ sorting: { field: "date", order: "desc" } }}
                pagination={response.pager}
                selection={selection}
                actions={actions}
                filterComponents={customFilters}
                onChange={updateTable}
            />

            {!!syncReport && <SyncSummary report={syncReport} onClose={() => setSyncReport(undefined)} />}

            {toDelete.length > 0 && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={confirmDelete}
                    onCancel={() => setToDelete([])}
                    title={i18n.t("Delete History Notifications?")}
                    description={i18n.t("Are you sure you want to delete {{total}} history notifications?", {
                        total: toDelete.length,
                    })}
                    saveText={i18n.t("Ok")}
                />
            )}
        </React.Fragment>
    );
});
