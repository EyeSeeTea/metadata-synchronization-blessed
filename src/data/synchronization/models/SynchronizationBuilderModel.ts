import { SynchronizationBuilder } from "../../../domain/synchronization/entities/SynchronizationBuilder";
import { Codec, Schema } from "../../../utils/codec";
import { DataSynchronizationParamsModel } from "../../aggregated/models/DataSynchronizationParamsModel";
import { FilterRuleModel } from "../../metadata/models/FilterRuleModel";
import { MetadataSynchronizationParamsModel } from "../../metadata/models/MetadataSynchronizationParamsModel";

export const SynchronizationBuilderModel: Codec<SynchronizationBuilder> = Schema.object({
    originInstance: Schema.optionalSafe(Schema.string, "LOCAL"),
    targetInstances: Schema.optionalSafe(Schema.array(Schema.string), []),
    metadataIds: Schema.optionalSafe(Schema.array(Schema.string), []),
    excludedIds: Schema.optionalSafe(Schema.array(Schema.string), []),
    metadataTypes: Schema.optional(Schema.array(Schema.string)),
    syncRule: Schema.optional(Schema.string),
    filterRules: Schema.optional(Schema.array(FilterRuleModel)),
    syncParams: Schema.optional(MetadataSynchronizationParamsModel),
    dataParams: Schema.optional(DataSynchronizationParamsModel),
});
