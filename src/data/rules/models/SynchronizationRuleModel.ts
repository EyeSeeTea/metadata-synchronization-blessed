import { SynchronizationRuleData } from "../../../domain/rules/entities/SynchronizationRule";
import { Codec, Schema } from "../../../utils/codec";
import { NamedRefModel, SharedRefModel } from "../../common/models/RefModel";
import { SynchronizationBuilderModel } from "../../synchronization/models/SynchronizationBuilderModel";
import { SynchronizationTypeModel } from "../../synchronization/models/SynchronizationTypeModel";

export const SynchronizationRuleModel: Codec<SynchronizationRuleData> = Schema.extend(
    SharedRefModel,
    Schema.object({
        code: Schema.optional(Schema.string),
        created: Schema.optionalSafe(Schema.date, () => new Date()),
        description: Schema.optional(Schema.string),
        builder: SynchronizationBuilderModel,
        targetInstances: Schema.optionalSafe(Schema.array(Schema.string), []),
        enabled: Schema.optionalSafe(Schema.boolean, false),
        lastExecuted: Schema.optional(Schema.date),
        lastExecutedBy: Schema.optional(NamedRefModel),
        frequency: Schema.optional(Schema.string),
        type: SynchronizationTypeModel,
    })
);
