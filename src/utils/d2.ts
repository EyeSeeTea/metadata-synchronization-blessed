import _ from "lodash";
import "../utils/lodash-mixins";
import i18n from "@dhis2/d2-i18n";
import { D2, Params } from "../types/d2";

export const d2BaseModelColumns = [
    { name: "displayName", text: i18n.t("Name"), sortable: true },
    { name: "lastUpdated", text: i18n.t("Last update"), sortable: true },
];

export const organisationUnitsColumns = [
    { name: "displayName", text: i18n.t("Name"), sortable: true },
    { name: "level", text: i18n.t("Level"), sortable: true },
    { name: "lastUpdated", text: i18n.t("Last update"), sortable: true },
];

export const d2BaseModelDetails = [
    { name: "displayName", text: i18n.t("Name") },
    { name: "shortName", text: i18n.t("Short name") },
    { name: "code", text: i18n.t("Code") },
    { name: "displayDescription", text: i18n.t("Description") },
    { name: "created", text: i18n.t("Created") },
    { name: "lastUpdated", text: i18n.t("Last update") },
    { name: "id", text: i18n.t("ID") },
    { name: "href", text: i18n.t("API link") },
];

export const organisationUnitsDetails = [
    { name: "level", text: i18n.t("Level"), sortable: true },
    ...d2BaseModelDetails,
];

export function cleanParams(options: Params): Params {
    return _.omitBy(options, value => _.isArray(value) && _.isEmpty(value));
}

export function cleanModelName(id: string, caller: string): string {
    const alias = ["parent", "children", "ancestors"];
    return alias.includes(id) ? caller : id;
}

export function cleanObject(element: any, excludeRules: string[]): any {
    return _.pick(element, _.difference(_.keys(element), excludeRules));
}

export function isD2Model(d2: D2, modelName: string): boolean {
    return !!d2.models[modelName];
}
