import _ from "lodash";
import { generateUid } from "d2/uid";

import {
    deleteData,
    deleteDataStore,
    getDataById,
    getDataStore,
    getPaginatedData,
    saveData,
    saveDataStore,
} from "./dataStore";
import { D2 } from "../types/d2";
import { SyncReportTableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import {
    SynchronizationReport,
    SynchronizationReportStatus,
    SynchronizationResult,
    SyncRuleType,
} from "../types/synchronization";

const dataStoreKey = "notifications";

export default class SyncReport {
    private results: SynchronizationResult[] | null;
    private readonly syncReport: SynchronizationReport;

    constructor(syncReport: SynchronizationReport) {
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

    public static build(syncReport: SynchronizationReport | undefined): SyncReport {
        return syncReport ? new SyncReport(syncReport) : this.create();
    }

    public static async get(d2: D2, id: string): Promise<SyncReport | null> {
        const data = await getDataById(d2, dataStoreKey, id);
        return !!data ? this.build(data) : null;
    }

    public static async list(
        d2: D2,
        filters: SyncReportTableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const { statusFilter, type } = filters;
        const { page = 1, pageSize = 20, paging = true, sorting } = pagination || {};

        const data = await getPaginatedData(d2, dataStoreKey, filters, { paging: false, sorting });
        const filteredObjects = _(data.objects)
            .filter(e => (statusFilter ? e.status === statusFilter : true))
            .filter(({ type: elementType = "metadata" }) => elementType === type)
            .value();

        const total = filteredObjects.length;
        const pageCount = paging ? Math.ceil(filteredObjects.length / pageSize) : 1;
        const firstItem = paging ? (page - 1) * pageSize : 0;
        const lastItem = paging ? firstItem + pageSize : total;
        const objects = _.slice(filteredObjects, firstItem, lastItem);

        console.log(data.objects, objects);

        return { objects, pager: { page, pageCount, total } };
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
