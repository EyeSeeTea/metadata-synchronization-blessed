import { TableInitialState, TablePagination } from "d2-ui-components";
import { generateUid } from "d2/uid";
import _ from "lodash";
import { D2 } from "../types/d2";
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
            ..._.pick(syncReport, ["id", "date", "user", "status", "types", "syncRule", "type"]),
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

    public static async get(d2: D2, id: string): Promise<SyncReport | null> {
        const data = await getDataById(d2, dataStoreKey, id);
        return !!data ? this.build(data) : null;
    }

    public static async list(
        d2: D2,
        filters: SyncReportTableFilters,
        state?: TableInitialState<SynchronizationReport>,
        paging: boolean = true
    ): Promise<{ rows: SynchronizationReport[]; pager: Partial<TablePagination> }> {
        const { statusFilter, syncRuleFilter, type } = filters;
        const { pagination, sorting } = state || {};
        const { page = 1, pageSize = 25 } = pagination || {};

        const data = await getPaginatedData(d2, dataStoreKey, filters, {
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

    public async save(d2: D2): Promise<void> {
        const exists = !!this.syncReport.id;
        const element = exists ? this.syncReport : { ...this.syncReport, id: generateUid() };

        if (exists) await this.remove(d2);
        await saveDataStore(d2, `${dataStoreKey}-${element.id}`, this.results);
        await saveData(d2, dataStoreKey, element);
    }

    public async remove(d2: D2): Promise<void> {
        await deleteDataStore(d2, `${dataStoreKey}-${this.syncReport.id}`);
        await deleteData(d2, dataStoreKey, this.syncReport);
    }

    public setStatus(status: SynchronizationReportStatus): void {
        this.syncReport.status = status;
    }

    public addSyncResult(...result: SynchronizationResult[]): void {
        this.results = _.unionBy([...result], this.results, "instance.id");
    }

    public async loadSyncResults(d2: D2): Promise<void> {
        const { id } = this.syncReport;
        if (id && !this.results) {
            this.results = await getDataStore(d2, `${dataStoreKey}-${id}`, []);
        }
    }

    public hasErrors(): boolean {
        return _.some(this.results, result =>
            _(["ERROR", "NETWORK ERROR"]).includes(result.status)
        );
    }
}
