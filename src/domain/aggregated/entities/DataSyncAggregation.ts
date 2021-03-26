import { GetSchemaType, Schema } from "../../../utils/codec";

export const DataSyncAggregationModel = Schema.oneOf([
    Schema.exact("DAILY"),
    Schema.exact("WEEKLY"),
    Schema.exact("MONTHLY"),
    Schema.exact("QUARTERLY"),
    Schema.exact("YEARLY"),
]);

export type DataSyncAggregation = GetSchemaType<typeof DataSyncAggregationModel>;
