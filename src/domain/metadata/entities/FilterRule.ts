import { generateUid } from "d2/uid";
import _ from "lodash";
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

export type FilterWhere = "startWith" | "contain" | "endWith";

export type FilterType = FilterRule["type"];

export const filterTypeNames: Record<FilterType, string> = {
    created: i18n.t("Created on"),
    lastUpdated: i18n.t("Last updated on"),
    stringMatch: i18n.t("String matches"),
    metadataType: i18n.t("Metadata type"),
};

export const whereNames: Record<FilterWhere, string> = {
    startWith: i18n.t("start with"),
    contain: i18n.t("contain"),
    endWith: i18n.t("end with"),
};

export function getInitialFilterRule(type: FilterType, id?: string): FilterRule {
    const base = { id: id || generateUid() };

    switch (type) {
        case "created":
        case "lastUpdated":
            return { ...base, type, value: { period: "FIXED" } };
        case "stringMatch":
            return { ...base, type, where: "contain", value: "" };
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

export function filterRuleToString(filterRule: FilterRule): string {
    switch (filterRule.type) {
        case "created":
            return i18n.t("Created") + ": " + getDateFilterString(filterRule.value);
        case "lastUpdated":
            return i18n.t("Last updated") + ": " + getDateFilterString(filterRule.value);
        case "stringMatch":
            const where = whereNames[filterRule.where];
            const strValue = _.truncate(filterRule.value, { length: 40 });
            return `Name/code/description ${where} '${strValue}'`;
        case "metadataType":
            return i18n.t("Metadata type") + ": " + filterRule.value;
    }
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
    switch (filterRule.type) {
        case "created":
        case "lastUpdated": {
            const { value } = filterRule;
            if (value.period === "FIXED" && !value.startDate && !value.endDate) {
                const msg = i18n.t("Select at least one date");
                return [{ property: "startDate", description: msg, error: "cannot_be_empty" }];
            } else {
                return [];
            }
        }
        case "stringMatch":
        case "metadataType": {
            if (!filterRule.value.trim()) {
                const msg = i18n.t("String to match cannot be empty");
                return [{ property: "value", description: msg, error: "cannot_be_empty" }];
            } else {
                return [];
            }
        }
    }
}
