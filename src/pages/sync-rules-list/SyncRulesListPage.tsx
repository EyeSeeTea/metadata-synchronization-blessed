import i18n from "@dhis2/d2-i18n";
import { Icon } from "@material-ui/core";
import { useD2, useD2Api } from "d2-api";
import {
    ConfirmationDialog,
    DatePicker,
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    useLoading,
    useSnackbar,
    TableState,
    ReferenceObject,
    TableSelection,
} from "d2-ui-components";
import _ from "lodash";
import { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";
import SharingDialog from "../../components/sharing-dialog/SharingDialog";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import { AggregatedSync } from "../../logic/sync/aggregated";
import { EventsSync } from "../../logic/sync/events";
import { SyncronizationClass } from "../../logic/sync/generic";
import { MetadataSync } from "../../logic/sync/metadata";
import Instance from "../../models/instance";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import { SyncRuleType } from "../../types/synchronization";
import { getValueForCollection } from "../../utils/d2-ui-components";
import {
    getUserInfo,
    isAppConfigurator,
    isAppExecutor,
    isGlobalAdmin,
    UserInfo,
} from "../../utils/permissions";
import { requestJSONDownload } from "../../utils/synchronization";
import { getValidationMessages } from "../../utils/validations";

const config: {
    [key: string]: {
        title: string;
        SyncClass: SyncronizationClass;
    };
} = {
    metadata: {
        title: i18n.t("Metadata Synchronization Rules"),
        SyncClass: MetadataSync,
    },
    aggregated: {
        title: i18n.t("Aggregated Data Synchronization Rules"),
        SyncClass: AggregatedSync,
    },
    events: {
        title: i18n.t("Events Synchronization Rules"),
        SyncClass: EventsSync,
    },
};

const enabledFilterData = [
    { id: "enabled", name: i18n.t("Enabled") },
    { id: "disabled", name: i18n.t("Disabled") },
];

const SyncRulesPage: React.FC = () => {
    const d2 = useD2();
    const api = useD2Api();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const history = useHistory();
    const { type } = useParams() as { type: SyncRuleType };
    const { title } = config[type];

    const [rows, setRows] = useState<SyncRule[]>([]);

    const [refreshKey, setRefreshKey] = useState(0);
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [search, setSearchFilter] = useState("");
    const [targetInstanceFilter, setTargetInstanceFilter] = useState("");
    const [enabledFilter, setEnabledFilter] = useState("");
    const [lastExecutedFilter, setLastExecutedFilter] = useState<Moment | null>(null);
    const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
    const [sharingSettingsObject, setSharingSettingsObject] = useState<any>(null);

    useEffect(() => {
        SyncRule.list(
            api,
            { type, targetInstanceFilter, enabledFilter, lastExecutedFilter, search },
            { paging: false }
        ).then(({ objects }) => {
            setRows(objects.map(SyncRule.build));
        });
    }, [
        api,
        refreshKey,
        type,
        search,
        targetInstanceFilter,
        enabledFilter,
        lastExecutedFilter,
        sharingSettingsObject,
    ]);

    const [allInstances, setAllInstances] = useState<Instance[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfo>();
    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [appConfigurator, setAppConfigurator] = useState(false);
    const [appExecutor, setAppExecutor] = useState(false);

    useEffect(() => {
        Instance.list(api, null, null).then(({ objects }) => setAllInstances(objects));
        getUserInfo(api).then(setUserInfo);
        isGlobalAdmin(api).then(setGlobalAdmin);
        isAppConfigurator(api).then(setAppConfigurator);
        isAppExecutor(api).then(setAppExecutor);
    }, [api]);

    const getTargetInstances = (rule: SyncRule) => {
        return _(rule.targetInstances)
            .map(id => allInstances.find(instance => instance.id === id))
            .compact()
            .map(({ name }) => ({ name }));
    };

    const getReadableFrequency = (rule: SyncRule) => {
        return rule.longFrequency;
    };

    const columns: TableColumn<SyncRule>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        {
            name: "targetInstances",
            text: i18n.t("Destination instances"),
            sortable: false,
            getValue: (ruleData: SyncRule) =>
                getTargetInstances(ruleData)
                    .map(e => e.name)
                    .join(", "),
        },
        {
            name: "frequency",
            text: i18n.t("Frequency"),
            sortable: true,
            getValue: getReadableFrequency,
        },
        {
            name: "enabled",
            text: i18n.t("Scheduling"),
            sortable: true,
            getValue: ({ enabled }) => (enabled ? i18n.t("Enabled") : i18n.t("Disabled")),
        },
        {
            name: "lastExecuted",
            text: i18n.t("Last executed"),
            sortable: true,
        },
    ];

    const details: ObjectsTableDetailField<SyncRule>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
        {
            name: "frequency",
            text: i18n.t("Frequency"),
            getValue: getReadableFrequency,
        },
        {
            name: "enabled",
            text: i18n.t("Scheduling"),
            getValue: ({ enabled }) => (enabled ? i18n.t("Enabled") : i18n.t("Disabled")),
        },
        { name: "lastExecuted", text: i18n.t("Last executed") },
        {
            name: "targetInstances",
            text: i18n.t("Destination instances"),
            getValue: ruleData => getValueForCollection(getTargetInstances(ruleData)),
        },
    ];

    const downloadJSON = async (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;
        loading.show(true, "Generating JSON file");
        const rule = await SyncRule.get(api, id);
        const { SyncClass } = config[rule.type];
        await requestJSONDownload(SyncClass, rule, d2 as D2, api);
        loading.reset();
    };

    const backHome = () => {
        history.push("/");
    };

    const confirmDelete = async () => {
        loading.show(true, i18n.t("Deleting Sync Rules"));

        const results = [];
        for (const id of toDelete) {
            const rule = await SyncRule.get(api, id);
            const deletedRuleLabel = `${rule.name} (${i18n.t("deleted")})`;

            results.push(await rule.remove(api));

            const syncReports = await SyncReport.list(
                api,
                { type: rule.type, syncRuleFilter: id },
                {},
                false
            );

            for (const syncReportData of syncReports.rows) {
                const editedSyncReport = {
                    ...syncReportData,
                    deletedSyncRuleLabel: deletedRuleLabel,
                };
                const syncReport = SyncReport.build(editedSyncReport);
                const syncResults = await syncReport.loadSyncResults(api);
                syncReport.addSyncResult(syncResults[0]);

                await syncReport.save(api);
            }
        }

        if (_.some(results, ["status", false])) {
            snackbar.error(i18n.t("Failed to delete some rules"));
        } else {
            snackbar.success(
                i18n.t("Successfully deleted {{count}} rules", { count: toDelete.length })
            );
        }

        loading.reset();
        setToDelete([]);
        updateSelection([]);
        setRefreshKey(Math.random());
    };

    const createRule = () => {
        history.push(`/sync-rules/${type}/new`);
    };

    const editRule = (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;

        history.push(`/sync-rules/${type}/edit/${id}`);
    };

    const replicateRule = async (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;
        const rule = await SyncRule.get(api, id);

        history.push({
            pathname: `/sync-rules/${type}/new`,
            state: { syncRule: rule.replicate() },
        });
    };

    const executeRule = async (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;
        const rule = await SyncRule.get(api, id);

        const { builder, id: syncRule, type = "metadata" } = rule;
        const { SyncClass } = config[type];

        const sync = new SyncClass(d2 as D2, api, { ...builder, syncRule });
        for await (const { message, syncReport, done } of sync.execute()) {
            if (message) loading.show(true, message);
            if (syncReport) await syncReport.save(api);
            if (done && syncReport) setSyncReport(syncReport);
        }

        setRefreshKey(Math.random());
        loading.reset();
    };

    const toggleEnable = async (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;
        const oldSyncRule = await SyncRule.get(api, id);

        const syncRule = oldSyncRule.updateEnabled(!oldSyncRule.enabled);
        const errors = await getValidationMessages(api, syncRule);
        if (errors.length > 0) {
            snackbar.error(errors.join("\n"), {
                autoHideDuration: null,
            });
        } else {
            await syncRule.save(api);
            snackbar.success(i18n.t("Successfully updated sync rule"));
            setRefreshKey(Math.random());
        }
    };

    const openSharingSettings = async (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;
        const syncRule = await SyncRule.get(api, id);

        setSharingSettingsObject({
            object: syncRule.toObject(),
            meta: { allowPublicAccess: true, allowExternalAccess: false },
        });
    };

    const verifyUserHasAccess = (rules: SyncRule[], condition = false) => {
        if (globalAdmin) return true;

        for (const rule of rules) {
            if (!!userInfo && !rule.isVisibleToUser(userInfo, "WRITE")) return false;
        }

        return condition;
    };

    const verifyUserCanEdit = (rules: SyncRule[]) => {
        return verifyUserHasAccess(rules, appConfigurator);
    };

    const verifyUserCanEditSharingSettings = (rules: SyncRule[]) => {
        return verifyUserHasAccess(rules, appConfigurator);
    };

    const verifyUserCanExecute = () => {
        return appExecutor;
    };

    const verifyUserCanConfigure = () => {
        return appConfigurator;
    };

    const actions: TableAction<SyncRule>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            primary: !appConfigurator,
        },
        {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            isActive: verifyUserCanEdit,
            onClick: editRule,
            primary: appConfigurator,
            icon: <Icon>edit</Icon>,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: true,
            isActive: verifyUserCanEdit,
            onClick: setToDelete,
            icon: <Icon>delete</Icon>,
        },
        {
            name: "execute",
            text: i18n.t("Execute"),
            multiple: false,
            isActive: verifyUserCanExecute,
            onClick: executeRule,
            icon: <Icon>settings_input_antenna</Icon>,
        },
        {
            name: "download",
            text: i18n.t("Download JSON"),
            multiple: false,
            onClick: downloadJSON,
            icon: <Icon>cloud_download</Icon>,
        },
        {
            name: "replicate",
            text: i18n.t("Replicate"),
            multiple: false,
            isActive: verifyUserCanConfigure,
            onClick: replicateRule,
            icon: <Icon>content_copy</Icon>,
        },
        {
            name: "toggleEnable",
            text: i18n.t("Toggle scheduling"),
            multiple: false,
            isActive: verifyUserCanEdit,
            onClick: toggleEnable,
            icon: <Icon>timer</Icon>,
        },
        {
            name: "sharingSettings",
            text: i18n.t("Sharing settings"),
            multiple: false,
            isActive: verifyUserCanEditSharingSettings,
            onClick: openSharingSettings,
            icon: <Icon>share</Icon>,
        },
    ];

    const onSearchRequest = (key: string) =>
        (d2 as D2).Api.getApi()
            //@ts-ignore
            .get("sharing/search", { key })
            //@ts-ignore
            .then(searchResult => searchResult);

    const onSharingChanged = async (updatedAttributes: any, onSuccess?: Function) => {
        const newSharingSettings = {
            meta: sharingSettingsObject.meta,
            object: {
                ...sharingSettingsObject.object,
                ...updatedAttributes,
            },
        };

        const syncRule = SyncRule.build(newSharingSettings.object);
        await syncRule.save(api);

        setSharingSettingsObject(newSharingSettings);
        if (onSuccess) onSuccess();
    };

    const renderCustomFilters = (
        <React.Fragment key={"sync-rule-list-filters"}>
            <DatePicker
                key={"date-filter"}
                placeholder={i18n.t("Last executed date")}
                value={lastExecutedFilter}
                onChange={setLastExecutedFilter}
                isFilter
            />
            <Dropdown
                key={"target-instance-filter"}
                items={allInstances}
                onValueChange={setTargetInstanceFilter}
                value={targetInstanceFilter}
                label={i18n.t("Destination Instance")}
            />
            <Dropdown
                key={"enabled-filter"}
                items={enabledFilterData}
                onValueChange={setEnabledFilter}
                value={enabledFilter}
                label={i18n.t("Scheduling")}
            />
        </React.Fragment>
    );

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        const { selection } = tableState;
        updateSelection(selection);
    };

    return (
        <TestWrapper>
            <PageHeader title={title} onBackClick={backHome} />
            <ObjectsTable<SyncRule>
                rows={rows}
                columns={columns}
                details={details}
                actions={actions}
                selection={selection}
                onChange={handleTableChange}
                onActionButtonClick={appConfigurator ? createRule : undefined}
                filterComponents={renderCustomFilters}
                searchBoxLabel={i18n.t("Search by name")}
                onChangeSearch={setSearchFilter}
            />

            {toDelete.length > 0 && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={confirmDelete}
                    onCancel={() => setToDelete([])}
                    title={i18n.t("Delete Rules?")}
                    description={
                        toDelete
                            ? i18n.t("Are you sure you want to delete {{count}} rules?", {
                                  count: toDelete.length,
                              })
                            : ""
                    }
                    saveText={i18n.t("Ok")}
                />
            )}

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(null)} />
            )}

            {!!sharingSettingsObject && (
                <SharingDialog
                    isOpen={true}
                    isDataShareable={false}
                    sharedObject={sharingSettingsObject}
                    onCancel={() => setSharingSettingsObject(null)}
                    onSharingChanged={onSharingChanged}
                    onSearchRequest={onSearchRequest}
                />
            )}
        </TestWrapper>
    );
};

export default SyncRulesPage;
