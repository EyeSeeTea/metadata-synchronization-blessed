import { generateUid } from "d2/uid";
import _ from "lodash";
import moment from "moment";
import i18n from "../../../locales";
import { NonNullableValues } from "../../../types/utils";
import { GetSchemaType, Schema } from "../../../utils/codec";
import { availablePeriods } from "../../../utils/synchronization";
import { DataSyncPeriodModel } from "../../aggregated/entities/DataSyncPeriod";
import { ValidationError } from "../../common/entities/Validations";

export const DateFilterModel = Schema.object({
    period: DataSyncPeriodModel,
    startDate: Schema.optional(Schema.date),
    endDate: Schema.optional(Schema.date),
});

export const FilterWhereModel = Schema.oneOf([
    Schema.exact("startsWith"),
    Schema.exact("contains"),
    Schema.exact("endsWith"),
]);

export const StringMatchModel = Schema.object({
    where: Schema.nullable(FilterWhereModel),
    value: Schema.string,
});

export const FilterRuleModel = Schema.object({
    id: Schema.string,
    metadataType: Schema.string,
    created: DateFilterModel,
    lastUpdated: DateFilterModel,
    stringMatch: StringMatchModel,
});

export type DateFilter = GetSchemaType<typeof DateFilterModel>;
export type FilterWhere = GetSchemaType<typeof FilterWhereModel>;
export type StringMatch = GetSchemaType<typeof StringMatchModel>;
export type FilterRule = GetSchemaType<typeof FilterRuleModel>;

export type FilterRuleField = keyof FilterRule;
export type ValidStringMatch = NonNullableValues<StringMatch>;

export const filterRuleFields: FilterRuleField[] = [
    "metadataType",
    "created",
    "lastUpdated",
    "stringMatch",
];

export const filterTypeNames: Record<keyof FilterRule, string> = {
    id: i18n.t("Id"),
    created: i18n.t("Created"),
    lastUpdated: i18n.t("Last updated"),
    stringMatch: i18n.t("String matches"),
    metadataType: i18n.t("Metadata type"),
};

export const whereNames: Record<FilterWhere, string> = {
    startsWith: i18n.t("Starts with"),
    contains: i18n.t("Contains"),
    endsWith: i18n.t("Ends with"),
};

export function getInitialFilterRule(): FilterRule {
    return {
        id: generateUid(),
        metadataType: "",
        created: { period: "ALL" },
        lastUpdated: { period: "ALL" },
        stringMatch: { where: null, value: "" },
    };
}

/* Functions */

export function updateFilterRule<Field extends keyof FilterRule>(
    filterRule: FilterRule,
    field: Field,
    value: FilterRule[Field]
): FilterRule {
    return { ...filterRule, [field]: value };
}

export function filterRuleToString(filterRule: FilterRule): string {
    const { created, lastUpdated, stringMatch } = filterRule;
    const main = i18n.t("Metadata type: {{model}}", {
        model: filterRule.metadataType,
        nsSeparator: false,
    });
    const fields = i18n.t("Name/code/description");
    const parts = [
        created && i18n.t("Created") + ": " + getDateFilterString(created),
        lastUpdated && i18n.t("Last updated") + ": " + getDateFilterString(lastUpdated),
        stringMatchHasValue(stringMatch) && `${getStringMatchString(stringMatch)} (${fields})`,
    ];
    return _([main, _.compact(parts).join(", ")])
        .compact()
        .join(" - ");
}

export function stringMatchHasValue(stringMatch: StringMatch): stringMatch is ValidStringMatch {
    return stringMatch.where && stringMatch.value.trim() ? true : false;
}

export function getStringMatchString(stringMatch: StringMatch): string {
    if (!stringMatchHasValue(stringMatch)) return "";
    const where = whereNames[stringMatch.where];
    const strValue = _.truncate(stringMatch.value, { length: 40 });
    return `${where} '${strValue}'`;
}

export function getDateFilterString(dateFilter: DateFilter): string {
    switch (dateFilter.period) {
        case "FIXED": {
            const { startDate, endDate } = dateFilter;
            const namespace = {
                startDate: moment(startDate).format("L"),
                endDate: moment(endDate).format("L"),
            };
            if (startDate && endDate) {
                return i18n.t("From {{- startDate}} to {{- endDate}}", namespace);
            } else if (startDate) {
                return i18n.t("From {{- startDate}}", namespace);
            } else if (endDate) {
                return i18n.t("To {{- endDate}}", namespace);
            } else {
                return "-";
            }
        }
        default:
            return availablePeriods[dateFilter.period]?.name || "-";
    }
}

const initialStringMatch: StringMatch = { value: "", where: "contains" };

export function updateStringMatch(
    filterRule: FilterRule,
    partial: Partial<StringMatch>
): FilterRule {
    return updateFilterRule(filterRule, "stringMatch", {
        ...initialStringMatch,
        ...filterRule.stringMatch,
        ...partial,
    });
}

export function validateFilterRule(filterRule: FilterRule): ValidationError[] {
    const validations = [
        !filterRule.metadataType && {
            property: "metadataType",
            description: i18n.t("You must select a metadata type"),
            error: "cannot_be_empty",
        },

        filterRule.created?.period === "FIXED" &&
            !filterRule.created?.startDate &&
            !filterRule.created?.endDate && {
                property: "created",
                description: i18n.t("Select at least one date for fixed period on create"),
                error: "cannot_be_empty",
            },

        filterRule.lastUpdated?.period === "FIXED" &&
            !filterRule.lastUpdated?.startDate &&
            !filterRule.lastUpdated?.endDate && {
                property: "created",
                description: i18n.t("Select at least one date for fixed period on create"),
                error: "cannot_be_empty",
            },
    ];

    return _.compact(validations);
}
