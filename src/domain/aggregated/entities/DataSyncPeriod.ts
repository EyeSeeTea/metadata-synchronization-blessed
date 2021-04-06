import { Codec, Schema } from "../../../utils/codec";

export const DataSyncPeriodModel: Codec<DataSyncPeriod> = Schema.oneOf([
    Schema.exact("ALL"),
    Schema.exact("FIXED"),
    Schema.exact("TODAY"),
    Schema.exact("YESTERDAY"),
    Schema.exact("LAST_7_DAYS"),
    Schema.exact("LAST_14_DAYS"),
    Schema.exact("THIS_WEEK"),
    Schema.exact("LAST_WEEK"),
    Schema.exact("THIS_MONTH"),
    Schema.exact("LAST_MONTH"),
    Schema.exact("THIS_QUARTER"),
    Schema.exact("LAST_QUARTER"),
    Schema.exact("THIS_YEAR"),
    Schema.exact("LAST_YEAR"),
]);

export type DataSyncPeriod =
    | "ALL"
    | "FIXED"
    | "TODAY"
    | "YESTERDAY"
    | "LAST_7_DAYS"
    | "LAST_14_DAYS"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "THIS_QUARTER"
    | "LAST_QUARTER"
    | "THIS_YEAR"
    | "LAST_YEAR";
