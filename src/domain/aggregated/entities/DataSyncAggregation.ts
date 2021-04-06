import { Schema, Codec } from "../../../utils/codec";

export const DataSyncAggregationModel: Codec<DataSyncAggregation> = Schema.oneOf([
    Schema.exact("DAILY"),
    Schema.exact("WEEKLY"),
    Schema.exact("MONTHLY"),
    Schema.exact("QUARTERLY"),
    Schema.exact("YEARLY"),
]);

export type DataSyncAggregation = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
