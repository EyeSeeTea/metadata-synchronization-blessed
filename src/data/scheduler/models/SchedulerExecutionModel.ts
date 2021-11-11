import { SchedulerExecution } from "../../../domain/scheduler/entities/SchedulerExecution";
import { Codec, Schema } from "../../../utils/codec";

export const SchedulerExecutionModel: Codec<SchedulerExecution> = Schema.object({
    lastExecutionDuration: Schema.optional(Schema.number),
    lastExecution: Schema.optional(Schema.date),
    nextExecution: Schema.optional(Schema.date),
});
