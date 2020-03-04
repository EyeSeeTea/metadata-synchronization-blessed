import i18n from "@dhis2/d2-i18n";
import DeleteIcon from "@material-ui/icons/Delete";
import DescriptionIcon from "@material-ui/icons/Description";
import { useD2 } from "d2-api";
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
} from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";
import SyncSummary, { formatStatusTag } from "../../components/sync-summary/SyncSummary";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import {
    SynchronizationReport,
    SynchronizationRule,
    SyncRuleType,
} from "../../types/synchronization";
import { getValueForCollection } from "../../utils/d2-ui-components";
import { isAppConfigurator } from "../../utils/permissions";

const config = {
    metadata: {
        title: i18n.t("Metadata Synchronization History"),
    },
    aggregated: {
        title: i18n.t("Aggregated Data Synchronization History"),
    },
    events: {
        title: i18n.t("Events Synchronization History"),
    },
};

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

const HistoryPage: React.FC = () => {
    const d2 = useD2();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const history = useHistory();
    const { id, type } = useParams() as { id: string; type: SyncRuleType };
    const { title } = config[type];

    const [syncRules, setSyncRules] = useState<SynchronizationRule[]>([]);
    const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [response, updateResponse] = useState<{
        rows: SynchronizationReport[];
        pager: Partial<TablePagination>;
    }>({ rows: [], pager: initialState.pagination });
    const [appConfigurator, setAppConfigurator] = useState(false);

    const [statusFilter, updateStatusFilter] = useState("");
    const [syncRuleFilter, updateSyncRuleFilter] = useState("");

    const goBack = () => history.goBack();

    const updateTable = useCallback(
        (tableState?: TableState<SynchronizationReport>) => {
            SyncReport.list(
                d2 as D2,
                { type, statusFilter, syncRuleFilter },
                tableState ?? initialState
            ).then(updateResponse);
            updateSelection(oldSelection => tableState?.selection ?? oldSelection);
        },
        [d2, statusFilter, syncRuleFilter, type, updateSelection]
    );

    useEffect(() => {
        SyncRule.list(d2 as D2, { type }, { paging: false }).then(({ objects }) =>
            setSyncRules(objects)
        );
        if (id) SyncReport.get(d2 as D2, id).then(setSyncReport);
        isAppConfigurator(d2 as D2).then(setAppConfigurator);
    }, [d2, id, type]);

    useEffect(() => {
        updateTable();
    }, [d2, updateTable, toDelete]);

    const columns: TableColumn<SynchronizationReport>[] = [
        {
            name: "syncRule",
            text: i18n.t("Sync Rule"),
            sortable: true,
            getValue: ({ syncRule: id }) =>
                _.find(syncRules, { id })?.name ?? i18n.t("(manual synchronization)"),
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
            getValue: notification =>
                getValueForCollection(notification.types.map(type => ({ name: type }))),
        },
        {
            name: "syncRule",
            text: i18n.t("Sync Rule"),
            getValue: ({ syncRule: id }) => {
                const syncRule = syncRules.find(e => e.id === id);
                if (!appConfigurator || !syncRule) return null;

                return (
                    <Link to={`/sync-rules/${type}/edit/${syncRule.id}`} target="_blank">
                        {i18n.t("Edit {{name}}", syncRule)}
                    </Link>
                );
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
        if (item) setSyncReport(SyncReport.build(item));
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
        const notifications = _(toDelete)
            .map(id => _.find(response.rows, ["id", id]))
            .compact()
            .map(data => new SyncReport(data))
            .value();

        const results = [];
        for (const notification of notifications) {
            results.push(await notification.remove(d2 as D2));
        }

        loading.reset();

        if (_.some(results, ["status", false])) {
            snackbar.error(i18n.t("Failed to delete some history notifications"));
        } else {
            snackbar.success(
                i18n.t("Successfully deleted {{count}} history notifications", {
                    count: toDelete.length,
                })
            );
        }

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
            <PageHeader title={title} onBackClick={goBack} />
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

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(null)} />
            )}

            {toDelete.length > 0 && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={confirmDelete}
                    onCancel={() => setToDelete([])}
                    title={i18n.t("Delete History Notifications?")}
                    description={i18n.t(
                        "Are you sure you want to delete {{count}} history notifications?",
                        { count: toDelete.length }
                    )}
                    saveText={i18n.t("Ok")}
                />
            )}
        </React.Fragment>
    );
};

export default HistoryPage;
