import { GetSchemaType, Schema } from "../../../utils/codec";

export const SynchronizationTypeModel = Schema.oneOf([
    Schema.exact("metadata"),
    Schema.exact("aggregated"),
    Schema.exact("events"),
    Schema.exact("deleted"),
]);

export const SynchronizationResultTypeModel = Schema.oneOf([
    Schema.exact("metadata"),
    Schema.exact("aggregated"),
    Schema.exact("events"),
    Schema.exact("deleted"),
    Schema.exact("trackedEntityInstances"),
]);

export type SynchronizationType = GetSchemaType<typeof SynchronizationTypeModel>;
export type SynchronizationResultType = GetSchemaType<typeof SynchronizationResultTypeModel>;
