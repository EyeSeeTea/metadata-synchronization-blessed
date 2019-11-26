import _ from "lodash";
import "../utils/lodash-mixins";
import i18n from "@dhis2/d2-i18n";
import { D2, Params } from "../types/d2";
import { TableColumn, ObjectsTableDetailField } from "d2-ui-components";

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
}

export const d2BaseModelColumns: TableColumn<MetadataType>[] = [
    { name: "displayName" as const, text: i18n.t("Name"), sortable: true },
    { name: "lastUpdated" as const, text: i18n.t("Last update"), sortable: true },
    { name: "id" as const, text: i18n.t("UID"), sortable: true },
];

export const organisationUnitsColumns: typeof d2BaseModelColumns = [
    ...d2BaseModelColumns,
    { name: "level" as const, text: i18n.t("Level"), sortable: true },
];

export const d2BaseModelDetails: ObjectsTableDetailField<MetadataType>[] = [
    { name: "displayName" as const, text: i18n.t("Name") },
    { name: "shortName" as const, text: i18n.t("Short name") },
    { name: "code" as const, text: i18n.t("Code") },
    { name: "description" as const, text: i18n.t("Description") },
    { name: "created" as const, text: i18n.t("Created") },
    { name: "lastUpdated" as const, text: i18n.t("Last update") },
    { name: "id" as const, text: i18n.t("ID") },
    { name: "href" as const, text: i18n.t("API link") },
];

export const organisationUnitsDetails: typeof d2BaseModelDetails = [
    ...d2BaseModelDetails,
    { name: "level" as const, text: i18n.t("Level") },
];

export const d2BaseModelFields = {
    id: include,
    displayName: include,
    shortName: include,
    code: include,
    description: include,
    created: include,
    lastUpdated: include,
    href: include,
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
