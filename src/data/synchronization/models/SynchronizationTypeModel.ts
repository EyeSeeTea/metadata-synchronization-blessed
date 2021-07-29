import {
    SynchronizationType,
    SynchronizationResultType,
} from "../../../domain/synchronization/entities/SynchronizationType";
import { Codec, Schema } from "../../../utils/codec";

export const SynchronizationTypeModel: Codec<SynchronizationType> = Schema.oneOf([
    Schema.exact("metadata"),
    Schema.exact("aggregated"),
    Schema.exact("events"),
    Schema.exact("deleted"),
]);

export const SynchronizationResultTypeModel: Codec<SynchronizationResultType> = Schema.oneOf([
    Schema.exact("metadata"),
    Schema.exact("aggregated"),
    Schema.exact("events"),
    Schema.exact("deleted"),
    Schema.exact("trackedEntityInstances"),
]);
