import { generateUid } from "d2/uid";
import moment from "moment";
import i18n from "../../../locales";
import { availablePeriods } from "../../../utils/synchronization";
import { DataSyncPeriod } from "../../aggregated/types";
import { ValidationError } from "../../common/entities/Validations";
import { Ref } from "../../common/entities/Ref";

export interface FilterRuleCreated extends Ref {
    type: "created";
    value: DateFilter;
}

export interface FilterRuleLastUpdated extends Ref {
    type: "lastUpdated";
    value: DateFilter;
}

export interface FilterRuleStringMatch extends Ref {
    type: "stringMatch";
    where: FilterWhere;
    value: string;
}

export interface FilterRuleMetadataType extends Ref {
    type: "metadataType";
    value: string;
}

export type FilterRule =
    | FilterRuleCreated
    | FilterRuleLastUpdated
    | FilterRuleStringMatch
    | FilterRuleMetadataType;

export type FilterWhere = "startsWith" | "contains" | "endsWith";

export type FilterType = FilterRule["type"];

export const filterTypeNames: Record<FilterType, string> = {
    created: i18n.t("Created on"),
    lastUpdated: i18n.t("Last updated on"),
    stringMatch: i18n.t("String matches"),
    metadataType: i18n.t("Metadata type"),
};

export const whereNames: Record<FilterWhere, string> = {
    startsWith: i18n.t("Starts with"),
    contains: i18n.t("Contains"),
    endsWith: i18n.t("Ends with"),
};

export function getInitialFilterRule(type: FilterType, id?: string): FilterRule {
    const base = { id: id || generateUid() };

    switch (type) {
        case "created":
        case "lastUpdated":
            return { ...base, type, value: { period: "FIXED" } };
        case "stringMatch":
            return { ...base, type, where: "contains", value: "" };
        case "metadataType":
            return { ...base, type, value: "" };
    }
}

interface DateFilter {
    period: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
}

export function updateFilterRule<FR extends FilterRule, Field extends keyof FR>(
    filterRule: FR,
    field: Field,
    value: FR[Field]
): FR {
    return { ...filterRule, [field]: value };
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

export function validateFilterRule(filterRule: FilterRule): ValidationError[] {
    if (filterRule.type === "created" || filterRule.type === "lastUpdated") {
        const { value } = filterRule;
        if (value.period === "FIXED" && !value.startDate && !value.endDate) {
            return [
                {
                    property: "startDate",
                    description: i18n.t("Select at least one date"),
                    error: "cannot_be_empty",
                },
            ];
        } else {
            return [];
        }
    } else if (filterRule.type === "stringMatch") {
        if (!filterRule.value.trim()) {
            return [
                {
                    property: "value",
                    description: i18n.t("String to match cannot be empty"),
                    error: "cannot_be_empty",
                },
            ];
        } else {
            return [];
        }
    } else if (filterRule.type === "metadataType") {
        return [];
    } else {
        return [];
    }
}
