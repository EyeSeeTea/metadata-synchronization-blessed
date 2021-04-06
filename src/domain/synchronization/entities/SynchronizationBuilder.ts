import { Codec, Schema } from "../../../utils/codec";
import {
    DataSynchronizationParams,
    DataSynchronizationParamsModel,
} from "../../aggregated/entities/DataSynchronizationParams";
import { FilterRule, FilterRuleModel } from "../../metadata/entities/FilterRule";
import {
    MetadataSynchronizationParams,
    MetadataSynchronizationParamsModel,
} from "../../metadata/entities/MetadataSynchronizationParams";

export const SynchronizationBuilderModel: Codec<SynchronizationBuilder> = Schema.object({
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

export interface SynchronizationBuilder {
    originInstance: string;
    targetInstances: string[];
    metadataIds: string[];
    filterRules?: FilterRule[];
    excludedIds: string[];
    metadataTypes?: string[];
    syncRule?: string;
    syncParams?: MetadataSynchronizationParams;
    dataParams?: DataSynchronizationParams;
}

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
