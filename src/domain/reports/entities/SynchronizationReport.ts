import { generateUid } from "d2/uid";
import _ from "lodash";
import { PartialBy } from "../../../types/utils";
import { SynchronizationType } from "../../synchronization/entities/SynchronizationType";
import { SynchronizationResult } from "./SynchronizationResult";

export class SynchronizationReport implements SynchronizationReportData {
    // TODO: Review functional
    private results: SynchronizationResult[] | null;
    public readonly id: string;
    public readonly date?: Date | undefined;
    public readonly user: string;
    // TODO: Review functional
    public status: SynchronizationReportStatus;
    // TODO: Review functional
    public types: string[];
    public readonly syncRule?: string | undefined;
    public readonly packageImport?: boolean | undefined;
    public readonly deletedSyncRuleLabel?: string | undefined;
    public readonly type: SynchronizationType;
    public readonly dataStats?: AggregatedDataStats[] | EventsDataStats[] | undefined;

    private constructor(syncReport: SynchronizationReportData) {
        this.results = null;
        this.id = syncReport.id;
        this.date = syncReport.date;
        this.user = syncReport.user;
        this.status = syncReport.status;
        this.types = syncReport.types;
        this.syncRule = syncReport.syncRule;
        this.deletedSyncRuleLabel = syncReport.deletedSyncRuleLabel;
        this.type = syncReport.type;
        this.dataStats = syncReport.dataStats;
        this.packageImport = syncReport.packageImport;
    }

    public static create(
        type: SynchronizationType = "metadata",
        user = "",
        packageImport?: boolean
    ): SynchronizationReport {
        return new SynchronizationReport({
            id: generateUid(),
            user,
            status: "READY" as SynchronizationReportStatus,
            types: [],
            type,
            packageImport,
        });
    }

    public static build(
        syncReport?: PartialBy<SynchronizationReportData, "id">
    ): SynchronizationReport {
        return syncReport
            ? new SynchronizationReport({ id: generateUid(), ...syncReport })
            : this.create();
    }

    public setStatus(status: SynchronizationReportStatus): void {
        this.status = status;
    }

    public setTypes(types: string[]): void {
        this.types = types;
    }

    public addSyncResult(...result: SynchronizationResult[]): void {
        this.results = _.unionBy(
            [...result],
            this.results,
            ({ instance, type, originPackage }) => `${instance.id}-${type}-${originPackage?.id}`
        );
    }

    public hasErrors(): boolean {
        return _.some(this.results, result => ["ERROR", "NETWORK ERROR"].includes(result.status));
    }

    public toObject(): SynchronizationReportData {
        return {
            id: this.id,
            date: this.date,
            user: this.user,
            status: this.status,
            types: this.types,
            syncRule: this.syncRule,
            packageImport: this.packageImport,
            deletedSyncRuleLabel: this.deletedSyncRuleLabel,
            type: this.type,
            dataStats: this.dataStats,
        };
    }
}

export interface SynchronizationReportData {
    id: string;
    date?: Date;
    user: string;
    status: SynchronizationReportStatus;
    types: string[];
    syncRule?: string;
    packageImport?: boolean;
    deletedSyncRuleLabel?: string;
    type: SynchronizationType;
    dataStats?: AggregatedDataStats[] | EventsDataStats[];
}

export type SynchronizationReportStatus = "READY" | "RUNNING" | "FAILURE" | "DONE";

export interface AggregatedDataStats {
    dataElement: string;
    count: number;
}

export interface EventsDataStats {
    program: string;
    count: number;
    orgUnits: string[];
}
