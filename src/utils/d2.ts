import i18n from "@dhis2/d2-i18n";
import { D2ModelSchemas } from "d2-api";
import { ObjectsTableDetailField, TableColumn } from "d2-ui-components";
import _ from "lodash";
import { D2, Params } from "../types/d2";
import "../utils/lodash-mixins";

const include = true as true;

export interface MetadataType {
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
    domainType?: "AGGREGATE" | "TRACKER" | "EVENT";
    __mappingType__: keyof D2ModelSchemas;
    __type__: keyof D2ModelSchemas;
    [key: string]: string | number | undefined;
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

export const organisationUnitsDetails: typeof d2BaseModelDetails = _.map(
    organisationUnitsColumns,
    column => _.pick(column, ["name", "text", "getValue"])
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
        dataElement: d2BaseModelFields,
    },
};

export const programFields = {
    ...d2BaseModelFields,
    programStages: {
        id: include,
        displayName: include,
        programStageDataElements: {
            dataElement: d2BaseModelFields,
        },
    },
};

export const organisationUnitFields = {
    ...d2BaseModelFields,
    level: include,
};

export function cleanParams(options: Params): Params {
    return _.omitBy(options, value => _.isArray(value) && _.isEmpty(value));
}

export function isD2Model(d2: D2, modelName: string): boolean {
    return !!d2.models[modelName];
}

export function cleanModelName(d2: D2, id: string, caller: string): string | null {
    if (isD2Model(d2, id)) {
        return d2.models[id].plural;
    } else if (id === "attributeValues") {
        return "attributes";
    } else if (id === "commentOptionSet") {
        return "optionSets";
    } else if (id === "groupSets" && caller.endsWith("Group")) {
        return caller + "Sets";
    } else if (_.includes(["parent", "children", "ancestors"], id)) {
        return caller;
    } else {
        return null;
    }
}

export function getClassName(className: string): string | undefined {
    return _(className)
        .split(".")
        .last();
}

export const getBaseUrl = (d2: D2): string => d2.Api.getApi().baseUrl;

export async function getCurrentUserOrganisationUnits(d2: D2): Promise<string[]> {
    const response: any = await d2.currentUser.getOrganisationUnits();
    const organisationUnitsIds: string[] = [...response.valuesContainerMap.keys()];
    return organisationUnitsIds;
}
