import { buildPeriodFromParams } from "../utils";
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
    async?: boolean;
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
    allTEIs?: boolean;
    excludeTeiRelationships?: boolean;
    excludeEventCoordinates?: boolean;
    generateNewUid?: boolean;
    enableAggregation?: boolean;
    aggregationType?: DataSyncAggregation;
    runAnalyticsBefore?: boolean;
    runAnalyticsAfter?: boolean;
    includeAnalyticsZeroValues?: boolean;
    analyticsYears?: number;
    ignoreDuplicateExistingValues?: boolean;
}

export function isDataSynchronizationRequired(params: DataSynchronizationParams, lastUpdated: string): boolean {
    const { period } = params;
    const { startDate } = buildPeriodFromParams(params);

    const isUpdatedAfterStartDate = new Date(lastUpdated).toISOString() >= startDate.format();
    const isLastSuccessfulSync = period === "SINCE_LAST_SUCCESSFUL_SYNC";

    return isUpdatedAfterStartDate || !isLastSuccessfulSync;
}
