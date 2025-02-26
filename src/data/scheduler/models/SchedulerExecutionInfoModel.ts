import { SchedulerExecutionInfo } from "../../../domain/scheduler/entities/SchedulerExecutionInfo";
import { Codec, Schema } from "../../../utils/codec";

export const SchedulerExecutionInfoModel: Codec<SchedulerExecutionInfo> = Schema.object({
    lastExecutionDuration: Schema.optional(Schema.number),
    lastExecution: Schema.optional(Schema.date),
    nextExecution: Schema.optional(Schema.date),
});
