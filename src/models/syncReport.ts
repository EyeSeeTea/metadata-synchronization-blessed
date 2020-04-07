import { D2Api } from "d2-api";
import { TableInitialState, TablePagination } from "d2-ui-components";
import { generateUid } from "d2/uid";
import _ from "lodash";
import { SyncReportTableFilters } from "../types/d2-ui-components";
import {
    SynchronizationReport,
    SynchronizationReportStatus,
    SynchronizationResult,
    SyncRuleType,
} from "../types/synchronization";
import {
    deleteData,
    deleteDataStore,
    getDataById,
    getDataStore,
    getPaginatedData,
    saveData,
    saveDataStore,
} from "./dataStore";

const dataStoreKey = "notifications";

type Optional<T, K extends keyof T> = Omit<T, K> & { [P in Extract<keyof T, K>]?: T[P] };

export default class SyncReport {
    private results: SynchronizationResult[] | null;
    private readonly syncReport: SynchronizationReport;

    constructor(syncReport: Optional<SynchronizationReport, "id">) {
        this.results = null;
        this.syncReport = {
            id: generateUid(),
            date: new Date(),
            ..._.pick(syncReport, [
                "id",
                "date",
                "user",
                "status",
                "types",
                "syncRule",
                "deletedSyncRuleLabel",
                "type",
                "dataStats",
            ]),
        };
    }

    public static create(type: SyncRuleType = "metadata"): SyncReport {
        return new SyncReport({
            id: "",
            user: "",
            status: "READY" as SynchronizationReportStatus,
            types: [],
            type,
        });
    }

    public static build(syncReport?: Optional<SynchronizationReport, "id">): SyncReport {
        return syncReport ? new SyncReport(syncReport) : this.create();
    }

    public static async get(api: D2Api, id: string): Promise<SyncReport | null> {
        const data = await getDataById<SynchronizationReport>(api, dataStoreKey, id);
        return data ? this.build(data) : null;
    }

    public static async list(
        api: D2Api,
        filters: SyncReportTableFilters,
        state?: TableInitialState<SynchronizationReport>,
        paging = true
    ): Promise<{ rows: SynchronizationReport[]; pager: Partial<TablePagination> }> {
        const { statusFilter, syncRuleFilter, type } = filters;
        const { pagination, sorting } = state || {};
        const { page = 1, pageSize = 25 } = pagination || {};

        const data = await getPaginatedData(api, dataStoreKey, filters, {
            paging: false,
            sorting: [sorting?.field ?? "id", sorting?.order ?? "asc"],
        });

        const filteredObjects = _(data.objects)
            .filter(e => (statusFilter ? e.status === statusFilter : true))
            .filter(e => (syncRuleFilter ? e.syncRule === syncRuleFilter : true))
            .filter(({ type: elementType = "metadata" }) => elementType === type)
            .value();

        const total = filteredObjects.length;
        const firstItem = paging ? (page - 1) * pageSize : 0;
        const lastItem = paging ? firstItem + pageSize : total;
        const rows = _.slice(filteredObjects, firstItem, lastItem);

        return { rows, pager: { ...pagination, page, pageSize, total } };
    }

    public async save(api: D2Api): Promise<void> {
        const exists = !!this.syncReport.id;
        const element = exists ? this.syncReport : { ...this.syncReport, id: generateUid() };

        if (exists) await this.remove(api);
        await saveDataStore(api, `${dataStoreKey}-${element.id}`, this.results);
        await saveData(api, dataStoreKey, element);
    }

    public async remove(api: D2Api): Promise<void> {
        await deleteDataStore(api, `${dataStoreKey}-${this.syncReport.id}`);
        await deleteData(api, dataStoreKey, this.syncReport);
    }

    public setStatus(status: SynchronizationReportStatus): void {
        this.syncReport.status = status;
    }

    public addSyncResult(...result: SynchronizationResult[]): void {
        this.results = _.unionBy(
            [...result],
            this.results,
            ({ instance, type }) => `${instance.id}-${type}`
        );
    }

    public async loadSyncResults(api: D2Api): Promise<SynchronizationResult[]> {
        const { id } = this.syncReport;
        return id ? getDataStore(api, `${dataStoreKey}-${id}`, []) : [];
    }

    public hasErrors(): boolean {
        return _.some(this.results, result =>
            _(["ERROR", "NETWORK ERROR"]).includes(result.status)
        );
    }

    public get id(): string | undefined {
        return this.syncReport.id;
    }
}
