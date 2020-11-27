import { SynchronizationType } from "./SynchronizationType";

export interface SynchronizationReport {
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
