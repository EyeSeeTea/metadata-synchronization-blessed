import moment from "moment-timezone";

import { DataSyncAggregation } from "./DataSyncAggregation";
import { DataSyncPeriod } from "./DataSyncPeriod";
import { EventsSyncPeriodField } from "./EventsSyncPeriodField";
import { TeisSyncPeriodField } from "./TeisSyncPeriodField";
import { Maybe } from "../../../types/utils";

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
    skipRuleEngine?: boolean;
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

const EPOCH_START = "1970-01-01";

export function isDataSynchronizationRequired(
    params: DataSynchronizationParams,
    lastUpdated: Maybe<string>,
    serverTimeZoneId: string
): boolean {
    const { period, startDate } = params;
    const isLastSuccessfulSync = period === "SINCE_LAST_SUCCESSFUL_SYNC";

    if (isLastSuccessfulSync) {
        const startDateMomentUTC = startDate ? moment.utc(startDate) : moment.utc(EPOCH_START);

        // lastUpdated is a string expressed in the local time zone of the DHIS2 server.
        const lastUpdatedUTC = moment.tz(lastUpdated, serverTimeZoneId).utc();

        const isUpdatedAfterStartDate = lastUpdated ? lastUpdatedUTC.isSameOrAfter(startDateMomentUTC) : false;
        return isUpdatedAfterStartDate;
    } else {
        return true;
    }
}
