import { DataSyncPeriod } from "../../../domain/aggregated/entities/DataSyncPeriod";
import { Codec, Schema } from "../../../utils/codec";

export const DataSyncPeriodModel: Codec<DataSyncPeriod> = Schema.oneOf([
    Schema.exact("ALL"),
    Schema.exact("FIXED"),
    Schema.exact("SINCE_LAST_EXECUTED_DATE"),
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
