import { generateUid } from "d2/uid";
import _ from "lodash";
import moment from "moment";
import i18n from "../../../locales";
import { availablePeriods } from "../../../utils/synchronization";
import { DataSyncPeriod } from "../../aggregated/types";
import { ValidationError } from "../../common/entities/Validations";
import { Maybe } from "../../../types/utils";

export interface FilterRule {
    id: string;
    metadataType: string;
    created: DateFilter;
    lastUpdated: DateFilter;
    stringMatch?: StringMatch;
}

export type FilterRuleField = keyof FilterRule;

export const filterRuleFields: FilterRuleField[] = [
    "metadataType",
    "created",
    "lastUpdated",
    "stringMatch",
];

export interface StringMatch {
    where: FilterWhere;
    value: string;
}

export type FilterWhere = "startWith" | "contain" | "endWith";

export const filterTypeNames: Record<keyof FilterRule, string> = {
    id: i18n.t("Id"),
    created: i18n.t("Created"),
    lastUpdated: i18n.t("Last updated"),
    stringMatch: i18n.t("String matches"),
    metadataType: i18n.t("Metadata type"),
};

export const whereNames: Record<FilterWhere, string> = {
    startWith: i18n.t("start with"),
    contain: i18n.t("contain"),
    endWith: i18n.t("end with"),
};

export function getInitialFilterRule(): FilterRule {
    return {
        id: generateUid(),
        metadataType: "",
        created: { period: "ALL" },
        lastUpdated: { period: "ALL" },
    };
}

interface DateFilter {
    period: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
}

export function updateFilterRule<Field extends keyof FilterRule>(
    filterRule: FilterRule,
    field: Field,
    value: FilterRule[Field]
): FilterRule {
    return { ...filterRule, [field]: value };
}

export function filterRuleToString(filterRule: FilterRule): string {
    const main = i18n.t("Metadata type: {{model}}", { model: filterRule.metadataType });
    const parts = [
        filterRule.created && i18n.t("Created") + ": " + getDateFilterString(filterRule.created),
        filterRule.lastUpdated &&
            i18n.t("Last updated") + ": " + getDateFilterString(filterRule.lastUpdated),
        filterRule.stringMatch &&
            i18n.t("Name/code/description" + "  " + getStringMatchString(filterRule.stringMatch)),
    ];
    return _([main, _.compact(parts).join(", ")])
        .compact()
        .join(" - ");
}

export function getStringMatchString(stringMatch: Maybe<StringMatch>): string {
    if (!stringMatch) return "";
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

const initialStringMatch: StringMatch = { value: "", where: "contain" };

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
