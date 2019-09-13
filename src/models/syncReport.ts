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
            ..._.pick(syncReport, ["id", "date", "user", "status", "types", "syncRule"]),
        };
    }

    public static create(): SyncReport {
        return new SyncReport({
            id: "",
            user: "",
            status: "READY" as SynchronizationReportStatus,
            types: [],
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
        const { statusFilter } = filters;
        const data = await getPaginatedData(d2, dataStoreKey, filters, pagination);
        return statusFilter
            ? { ...data, objects: _.filter(data.objects, e => e.status === statusFilter) }
            : data;
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
