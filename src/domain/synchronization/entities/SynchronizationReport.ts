import { SyncRuleType } from "./SynchronizationRule";

export interface SynchronizationReport {
    id: string;
    date?: Date;
    user: string;
    status: SynchronizationReportStatus;
    types: string[];
    syncRule?: string;
    deletedSyncRuleLabel?: string;
    type: SyncRuleType;
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
