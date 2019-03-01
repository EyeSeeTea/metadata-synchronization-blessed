import _ from "lodash";
import i18n from "@dhis2/d2-i18n";

export const d2BaseModelColumns = [
    { name: "displayName", text: i18n.t("Name") },
    { name: "lastUpdated", text: i18n.t("Last update") },
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

export function cleanOptions(options) {
    return _.omitBy(options, value => _.isArray(value) && _.isEmpty(value));
}
