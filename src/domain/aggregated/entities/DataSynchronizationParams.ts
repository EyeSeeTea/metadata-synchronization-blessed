import moment from "moment";
import { buildPeriodFromParams } from "../utils";
import { DataSyncAggregation } from "./DataSyncAggregation";
import { DataSyncPeriod } from "./DataSyncPeriod";
import { EventsSyncPeriodField } from "./EventsSyncPeriodField";
import { TeisSyncPeriodField } from "./TeisSyncPeriodField";

export interface DataImportParams {
    idScheme?: "UID" | "CODE";
    dataElementIdScheme?: "UID" | "CODE" | "NAME";
    orgUnitIdScheme?: "UID" | "CODE" | "NAME";
    dryRun?: boolean;
    importMode?: "COMMIT" | "VALIDATE"; // used to be dryRun in new tracker endpoint
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
    teisSyncPeriodField?: TeisSyncPeriodField;
    eventsSyncPeriodField?: EventsSyncPeriodField;
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

export function isDataSynchronizationRequired(params: DataSynchronizationParams, lastUpdated?: string): boolean {
    const { period } = params;
    // Moment object in UTC
    const { startDate: startDateMoment } = buildPeriodFromParams(params);

    // lastUpdated is a string in UTC from DHIS2, e.g. "2025-08-19T15:48:46.184". To avoid timezone ambiguity, we parse it with moment.utc()
    const lastUpdatedMoment = moment.utc(lastUpdated);

    const isUpdatedAfterStartDate = lastUpdated && lastUpdatedMoment.isSameOrAfter(startDateMoment);
    const isLastSuccessfulSync = period === "SINCE_LAST_SUCCESSFUL_SYNC";

    return !!isUpdatedAfterStartDate || !isLastSuccessfulSync;
}
