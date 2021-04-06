import { Codec, Schema } from "../../../utils/codec";
import { DataSyncAggregation, DataSyncAggregationModel } from "./DataSyncAggregation";
import { DataSyncPeriod, DataSyncPeriodModel } from "./DataSyncPeriod";

export const DataImportParamsModel: Codec<DataImportParams> = Schema.object({
    idScheme: Schema.optional(Schema.oneOf([Schema.exact("UID"), Schema.exact("CODE")])),
    dataElementIdScheme: Schema.optional(
        Schema.oneOf([Schema.exact("UID"), Schema.exact("CODE"), Schema.exact("NAME")])
    ),
    orgUnitIdScheme: Schema.optional(
        Schema.oneOf([Schema.exact("UID"), Schema.exact("CODE"), Schema.exact("NAME")])
    ),
    dryRun: Schema.optional(Schema.boolean),
    preheatCache: Schema.optional(Schema.boolean),
    skipExistingCheck: Schema.optional(Schema.boolean),
    skipAudit: Schema.optional(Schema.boolean),
    strategy: Schema.optional(
        Schema.oneOf([
            Schema.exact("NEW_AND_UPDATES"),
            Schema.exact("NEW"),
            Schema.exact("UPDATES"),
            Schema.exact("DELETES"),
        ])
    ),
});

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

export const DataSynchronizationParamsModel: Codec<DataSynchronizationParams> = Schema.extend(
    DataImportParamsModel,
    Schema.object({
        attributeCategoryOptions: Schema.optional(Schema.array(Schema.string)),
        orgUnitPaths: Schema.optional(Schema.array(Schema.string)),
        allAttributeCategoryOptions: Schema.optional(Schema.boolean),
        period: Schema.optional(DataSyncPeriodModel),
        startDate: Schema.optional(Schema.date),
        endDate: Schema.optional(Schema.date),
        lastUpdated: Schema.optional(Schema.date),
        events: Schema.optional(Schema.array(Schema.string)),
        teis: Schema.optional(Schema.array(Schema.string)),
        allEvents: Schema.optional(Schema.boolean),
        excludeTeiRelationships: Schema.optional(Schema.boolean),
        generateNewUid: Schema.optional(Schema.boolean),
        enableAggregation: Schema.optional(Schema.boolean),
        aggregationType: Schema.optional(DataSyncAggregationModel),
        runAnalytics: Schema.optional(Schema.boolean),
        includeAnalyticsZeroValues: Schema.optional(Schema.boolean),
        analyticsYears: Schema.optional(Schema.number),
        ignoreDuplicateExistingValues: Schema.optional(Schema.boolean),
    })
);

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
