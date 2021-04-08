import { Schema } from "../../../utils/codec";
import { SharedRefModel } from "../../common/models/RefModel";
import { SynchronizationBuilderModel } from "../../synchronization/models/SynchronizationBuilderModel";
import { SynchronizationTypeModel } from "../../synchronization/models/SynchronizationTypeModel";

export const SynchronizationRuleModel = Schema.extend(
    SharedRefModel,
    Schema.object({
        code: Schema.optionalSafe(Schema.string, ""),
        created: Schema.optionalSafe(Schema.date, () => new Date()),
        description: Schema.optionalSafe(Schema.string, ""),
        builder: SynchronizationBuilderModel,
        targetInstances: Schema.optionalSafe(Schema.array(Schema.string), []),
        enabled: Schema.optionalSafe(Schema.boolean, false),
        lastExecuted: Schema.optional(Schema.date),
        lastExecutedBy: Schema.optional(Schema.string),
        frequency: Schema.optional(Schema.string),
        type: SynchronizationTypeModel,
    })
);
