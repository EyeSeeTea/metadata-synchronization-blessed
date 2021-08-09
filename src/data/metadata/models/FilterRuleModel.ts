import { DateFilter, FilterRule, FilterWhere, StringMatch } from "../../../domain/metadata/entities/FilterRule";
import { Codec, Schema } from "../../../utils/codec";
import { DataSyncPeriodModel } from "../../aggregated/models/DataSyncPeriodModel";

export const DateFilterModel: Codec<DateFilter> = Schema.object({
    period: DataSyncPeriodModel,
    startDate: Schema.optional(Schema.date),
    endDate: Schema.optional(Schema.date),
});

export const FilterWhereModel: Codec<FilterWhere> = Schema.oneOf([
    Schema.exact("startsWith"),
    Schema.exact("contains"),
    Schema.exact("endsWith"),
]);

export const StringMatchModel: Codec<StringMatch> = Schema.object({
    where: Schema.nullable(FilterWhereModel),
    value: Schema.string,
});

export const FilterRuleModel: Codec<FilterRule> = Schema.object({
    id: Schema.string,
    metadataType: Schema.string,
    created: DateFilterModel,
    lastUpdated: DateFilterModel,
    stringMatch: StringMatchModel,
});
