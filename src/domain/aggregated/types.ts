import { DataImportParams } from "../../types/d2";

export interface DataSynchronizationParams extends DataImportParams {
    attributeCategoryOptions?: string[];
    allAttributeCategoryOptions?: boolean;
    orgUnitPaths?: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
    lastUpdated?: Date;
    events?: string[];
    allEvents?: boolean;
    generateNewUid?: boolean;
    enableAggregation?: boolean;
    aggregationType?: DataSyncAggregation;
    runAnalytics?: boolean;
}

export type DataSyncPeriod =
    | "ALL"
    | "FIXED"
    | "TODAY"
    | "YESTERDAY"
    | "LAST_7_DAYS"
    | "LAST_14_DAYS"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "THIS_QUARTER"
    | "LAST_QUARTER"
    | "THIS_YEAR"
    | "LAST_YEAR";

export type DataSyncAggregation = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
