import { DataSyncAggregation } from "./DataSyncAggregation";
import { DataSyncPeriod } from "./DataSyncPeriod";

export interface DataImportParams {
    idScheme?: "UID" | "CODE";
    dataElementIdScheme?: "UID" | "CODE" | "NAME";
    orgUnitIdScheme?: "UID" | "CODE" | "NAME";
    dryRun?: boolean;
    preheatCache?: boolean;
    skipExistingCheck?: boolean;
    skipAudit?: boolean;
    strategy?: "NEW_AND_UPDATES" | "NEW" | "UPDATES" | "DELETES";
}

export interface DataSynchronizationParams extends DataImportParams {
    attributeCategoryOptions?: string[];
    allAttributeCategoryOptions?: boolean;
    orgUnitPaths?: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
    lastUpdated?: Date;
    events?: string[];
    teis?: string[];
    allEvents?: boolean;
    excludeTeiRelationships?: boolean;
    generateNewUid?: boolean;
    enableAggregation?: boolean;
    aggregationType?: DataSyncAggregation;
    runAnalytics?: boolean;
    includeAnalyticsZeroValues?: boolean;
    analyticsYears?: number;
    ignoreDuplicateExistingValues?: boolean;
}
