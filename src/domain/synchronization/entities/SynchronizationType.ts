import { Codec, Schema } from "../../../utils/codec";

export const SynchronizationTypeModel: Codec<SynchronizationType> = Schema.oneOf([
    Schema.exact("metadata"),
    Schema.exact("aggregated"),
    Schema.exact("events"),
    Schema.exact("deleted"),
]);

export type SynchronizationType = "metadata" | "aggregated" | "events" | "deleted";

export const SynchronizationResultTypeModel: Codec<SynchronizationResultType> = Schema.oneOf([
    Schema.exact("metadata"),
    Schema.exact("aggregated"),
    Schema.exact("events"),
    Schema.exact("deleted"),
    Schema.exact("trackedEntityInstances"),
]);

export type SynchronizationResultType =
    | "metadata"
    | "aggregated"
    | "events"
    | "deleted"
    | "trackedEntityInstances";
