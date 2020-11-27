import { ObjectsTableDetailField, TableColumn } from "d2-ui-components";
import _ from "lodash";
import i18n from "../locales";
import { D2Model } from "../models/dhis/default";
import "../utils/lodash-mixins";

const include = true as const;

export interface MetadataType {
    model: typeof D2Model;
    id: string;
    name: string;
    displayName: string;
    shortName: string;
    code: string;
    description: string;
    created: string;
    lastUpdated: string;
    href: string;
    level?: number;
    path?: string;
    domainType?: "AGGREGATE" | "TRACKER" | "EVENT";
    categoryCombo?: {
        id: string;
    };
    optionSet?: {
        id: string;
    };
    programType?: "WITHOUT_REGISTRATION" | "WITH_REGISTRATION";
    [key: string]: unknown;
}

export const d2BaseModelColumns: TableColumn<MetadataType>[] = [
    { name: "displayName", text: i18n.t("Name"), sortable: true },
    { name: "shortName", text: i18n.t("Short name"), sortable: true, hidden: true },
    { name: "code", text: i18n.t("Code"), sortable: true, hidden: true },
    { name: "description", text: i18n.t("Description"), sortable: true, hidden: true },
    { name: "created", text: i18n.t("Created"), sortable: true, hidden: true },
    { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
    { name: "id", text: i18n.t("ID"), sortable: true, hidden: true },
    { name: "href", text: i18n.t("API link"), sortable: false, hidden: true },
];

export const d2BaseModelDetails: ObjectsTableDetailField<MetadataType>[] = _.map(
    d2BaseModelColumns,
    column => _.pick(column, ["name", "text", "getValue"])
);

export const organisationUnitsColumns: typeof d2BaseModelColumns = [
    { name: "displayName", text: i18n.t("Name"), sortable: true },
    { name: "shortName", text: i18n.t("Short name"), sortable: true, hidden: true },
    { name: "code", text: i18n.t("Code"), sortable: true, hidden: true },
    { name: "level", text: i18n.t("Level"), sortable: true },
    { name: "description", text: i18n.t("Description"), sortable: true, hidden: true },
    { name: "created", text: i18n.t("Created"), sortable: true, hidden: true },
    { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
    { name: "id", text: i18n.t("ID"), sortable: true, hidden: true },
    { name: "href", text: i18n.t("API link"), sortable: false, hidden: true },
];

export const programRuleActionsColumns: typeof d2BaseModelColumns = [
    { name: "id", text: i18n.t("ID"), sortable: true },
    { name: "programRuleActionType", text: i18n.t("Action"), sortable: true },
    { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
    { name: "programRule", text: i18n.t("Program Rule"), sortable: true, hidden: true },
    { name: "created", text: i18n.t("Created"), sortable: true, hidden: true },
    { name: "href", text: i18n.t("API link"), sortable: false, hidden: true },
];

export const organisationUnitsDetails: typeof d2BaseModelDetails = _.map(
    organisationUnitsColumns,
    column => _.pick(column, ["name", "text", "getValue"])
);

export const documentColumns: typeof d2BaseModelColumns = [
    { name: "displayName", text: i18n.t("Name"), sortable: true },
    { name: "created", text: i18n.t("Created"), sortable: true, hidden: true },
    { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
    { name: "id", text: i18n.t("ID"), sortable: true, hidden: true },
    { name: "url", text: i18n.t("Url"), sortable: true, hidden: true },
    { name: "href", text: i18n.t("API link"), sortable: false, hidden: true },
];

export const documentDetails: typeof d2BaseModelDetails = _.map(documentColumns, column =>
    _.pick(column, ["name", "text", "getValue"])
);

export const d2BaseModelFields = {
    id: include,
    name: include,
    displayName: include,
    shortName: include,
    code: include,
    description: include,
    created: include,
    lastUpdated: include,
    href: include,
};

export const dataElementFields = {
    ...d2BaseModelFields,
    domainType: include,
    categoryCombo: include,
    optionSet: include,
};

export const dataElementGroupFields = {
    ...d2BaseModelFields,
    dataElements: d2BaseModelFields,
};

export const dataElementGroupSetFields = {
    ...d2BaseModelFields,
    dataElementGroups: {
        ...d2BaseModelFields,
        dataElements: d2BaseModelFields,
    },
};

export const dataSetFields = {
    ...d2BaseModelFields,
    dataSetElements: {
        dataElement: dataElementFields,
    },
};

export const programFields = {
    ...d2BaseModelFields,
    programType: include,
    categoryCombo: include,
};

export const programFieldsWithDataElements = {
    ...programFields,
    programStages: {
        id: include,
        displayName: include,
        programStageDataElements: {
            dataElement: dataElementFields,
        },
    },
};

export const programFieldsWithIndicators = {
    ...programFields,
    programIndicators: d2BaseModelFields,
};

export const organisationUnitFields = {
    ...d2BaseModelFields,
    level: include,
    path: include,
};

export const programRuleActionsFields = {
    ...d2BaseModelFields,
    programRuleActionType: include,
    programRule: include,
};

export const categoryOptionFields = {
    ...d2BaseModelFields,
    categories: {
        id: include,
        displayName: include,
    },
};

export const optionFields = {
    ...d2BaseModelFields,
    optionSet: {
        id: include,
        displayName: include,
    },
};

export const documentFields = {
    ...d2BaseModelFields,
    url: include,
    external: include,
};
