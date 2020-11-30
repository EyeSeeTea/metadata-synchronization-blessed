import { TableInitialState, TablePagination } from "d2-ui-components";
import { generateUid } from "d2/uid";
import _ from "lodash";
import { Namespace } from "../domain/storage/Namespaces";
import {
    SynchronizationReport,
    SynchronizationReportStatus,
} from "../domain/synchronization/entities/SynchronizationReport";
import { SynchronizationResult } from "../domain/synchronization/entities/SynchronizationResult";
import { SynchronizationType } from "../domain/synchronization/entities/SynchronizationType";
import { D2Api } from "../types/d2-api";
import { SyncReportTableFilters } from "../types/d2-ui-components";
import {
    deleteData,
    deleteDataStore,
    getDataById,
    getDataStore,
    getPaginatedData,
    saveData,
    saveDataStore,
} from "./dataStore";

const dataStoreKey = Namespace.HISTORY;

type Optional<T, K extends keyof T> = Omit<T, K> & { [P in Extract<keyof T, K>]?: T[P] };

export default class SyncReport {
    private results: SynchronizationResult[] | null;
    public readonly syncReport: SynchronizationReport;

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
                "packageImport",
            ]),
        };
    }

    public static create(
        type: SynchronizationType = "metadata",
        user = "",
        packageImport?: boolean
    ): SyncReport {
        return new SyncReport({
            user,
            status: "READY" as SynchronizationReportStatus,
            types: [],
            type,
            packageImport,
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

    public setTypes(types: string[]): void {
        this.syncReport.types = types;
    }

    public addSyncResult(...result: SynchronizationResult[]): void {
        this.results = _.unionBy(
            [...result],
            this.results,
            ({ instance, type, originPackage }) => `${instance.id}-${type}-${originPackage?.id}`
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
