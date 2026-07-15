import { Codec, Schema } from "../../../utils/codec";
import { NamedRefModel, RefModel } from "../../common/models/RefModel";
import { SharingSettingModel } from "../../common/models/SharingSettingModel";
import { SynchronizationBuilderModel } from "../../synchronization/models/SynchronizationBuilderModel";
import { SynchronizationTypeModel } from "../../synchronization/models/SynchronizationTypeModel";
import { SyncRulePersistedData } from "./SyncRulePersistedData";

const BaseModel = Schema.object({
    user: Schema.optionalSafe(NamedRefModel, { id: "unknown", name: "Unknown user" }),
    created: Schema.optionalSafe(Schema.date, () => new Date()),
    lastUpdated: Schema.optionalSafe(Schema.date, () => new Date()),
    lastUpdatedBy: Schema.optionalSafe(NamedRefModel, { id: "unknown", name: "Unknown user" }),
    publicAccess: Schema.optionalSafe(Schema.string, "--------"),
    userAccesses: Schema.optionalSafe(Schema.array(SharingSettingModel), []),
    userGroupAccesses: Schema.optionalSafe(Schema.array(SharingSettingModel), []),
});

export const SynchronizationRuleModel: Codec<SyncRulePersistedData> = Schema.extend(
    BaseModel,
    Schema.object({
        id: Schema.string,
        name: Schema.string,
        code: Schema.optional(Schema.string),
        description: Schema.optional(Schema.string),
        builder: SynchronizationBuilderModel,
        targetInstances: Schema.optionalSafe(Schema.array(Schema.string), []),
        enabled: Schema.optionalSafe(Schema.boolean, false),
        lastExecuted: Schema.optional(Schema.date),
        lastExecutedBy: Schema.optional(NamedRefModel),
        lastSuccessfulSync: Schema.optional(Schema.date),
        frequency: Schema.optional(Schema.string),
        type: SynchronizationTypeModel,
        useAggregatedDataExchange: Schema.optional(Schema.boolean),
        aggregatedDataExchanges: Schema.optional(Schema.array(RefModel)),
        useAggregatedDataExchangeDhis2Job: Schema.optional(Schema.boolean),
        aggregatedDataExchangeDhis2Job: Schema.optional(RefModel),
    })
);
