import { generateUid } from "d2/uid";
import _ from "lodash";
import { PartialBy } from "../../../types/utils";
import { SynchronizationType } from "../../synchronization/entities/SynchronizationType";
import { SynchronizationResult } from "./SynchronizationResult";
import { Store } from "../../stores/entities/Store";
import { PublicInstance } from "../../instance/entities/Instance";

export class SynchronizationReport implements SynchronizationReportData {
    private results: SynchronizationResult[] | null;
    public status: SynchronizationReportStatus;
    public types: string[];
    public deletedSyncRuleLabel?: string | undefined;

    public readonly id: string;
    public readonly date: Date;
    public readonly user: string;
    public readonly syncRule?: string | undefined;
    public readonly packageImport?: boolean | undefined;
    public readonly type: SynchronizationType;
    public readonly dataStats?: AggregatedDataStats[] | EventsDataStats[] | undefined;

    private constructor(syncReport: PartialBy<SynchronizationReportData, "id" | "date">) {
        this.results = null;
        this.id = syncReport.id ?? generateUid();
        this.date = syncReport.date ?? new Date();
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
            user,
            status: "READY" as SynchronizationReportStatus,
            types: [],
            type,
            packageImport,
        });
    }

    public static build(data?: PartialBy<SynchronizationReportData, "id" | "date">): SynchronizationReport {
        return data ? new SynchronizationReport(data) : this.create();
    }

    public setStatus(status: SynchronizationReportStatus): void {
        this.status = status;
    }

    public setTypes(types: string[]): void {
        this.types = types;
    }

    public setDeletedSyncRuleLabel(label: string): void {
        this.deletedSyncRuleLabel = label;
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

    public getResultsForSave(): SynchronizationResult[] {
        return (this.results || []).map(({ payload: _payload, instance, origin, ...rest }) => {
            const originValue =
                origin && (origin as Store).token
                    ? origin
                    : origin && (origin as PublicInstance).name
                    ? { id: origin.id, name: (origin as PublicInstance).name }
                    : undefined;

            return {
                ...rest,
                instance: { id: instance.id, name: instance.name },
                origin: originValue,
            };
        });
    }

    public getResults(): SynchronizationResult[] {
        return this.results ?? [];
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
