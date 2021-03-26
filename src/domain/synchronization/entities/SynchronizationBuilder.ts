import { GetSchemaType, Schema } from "../../../utils/codec";
import { DataSynchronizationParamsModel } from "../../aggregated/entities/DataSynchronizationParams";
import { FilterRuleModel } from "../../metadata/entities/FilterRule";
import { MetadataSynchronizationParamsModel } from "../../metadata/entities/MetadataSynchronizationParams";

export const SynchronizationBuilderModel = Schema.object({
    originInstance: Schema.string,
    targetInstances: Schema.optionalSafe(Schema.array(Schema.string), []),
    metadataIds: Schema.optionalSafe(Schema.array(Schema.string), []),
    excludedIds: Schema.optionalSafe(Schema.array(Schema.string), []),
    metadataTypes: Schema.optional(Schema.array(Schema.string)),
    syncRule: Schema.optional(Schema.string),
    filterRules: Schema.optional(Schema.array(FilterRuleModel)),
    syncParams: Schema.optional(MetadataSynchronizationParamsModel),
    dataParams: Schema.optional(DataSynchronizationParamsModel),
});

export type SynchronizationBuilder = GetSchemaType<typeof SynchronizationBuilderModel>;

// TODO: When migration to fully defined schemas, this should be removed and use Schema.decode instead
export const defaultSynchronizationBuilder: SynchronizationBuilder = {
    originInstance: "LOCAL",
    targetInstances: [],
    metadataIds: [],
    filterRules: [],
    excludedIds: [],
    metadataTypes: [],
    dataParams: {
        strategy: "NEW_AND_UPDATES",
        allAttributeCategoryOptions: true,
        dryRun: false,
        allEvents: true,
        enableAggregation: false,
        aggregationType: undefined,
    },
    syncParams: {
        importStrategy: "CREATE_AND_UPDATE",
        enableMapping: false,
        includeSharingSettings: true,
        removeOrgUnitReferences: false,
        useDefaultIncludeExclude: true,
        atomicMode: "ALL",
        mergeMode: "MERGE",
        importMode: "COMMIT",
    },
};
