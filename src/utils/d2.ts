import i18n from "@dhis2/d2-i18n";
import { ObjectsTableDetailField, TableColumn } from "d2-ui-components";
import _ from "lodash";
import { D2Model } from "../models/dhis/default";
import { D2 } from "../types/d2";
import "../utils/lodash-mixins";

const include = true as true;

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

export function isD2Model(d2: D2, modelName: string): boolean {
    return !!d2.models[modelName];
}

export function cleanToModelName(d2: D2, id: string, caller: string): string | null {
    if (isD2Model(d2, id)) {
        return d2.models[id].plural;
    } else if (id === "attributeValues") {
        return "attributes";
    } else if (id === "commentOptionSet") {
        return "optionSets";
    } else if (id === "groupSets" && caller.endsWith("Group")) {
        return caller + "Sets";
    } else if (id === "workflow") {
        return "dataApprovalWorkflow";
    } else if (id === "notificationTemplates") {
        return "programNotificationTemplates";
    }
    // This options are for organisationUnit rule in organisationUnit model and
    // currently does not exits organisationUnit include rules for organisationUnit model
    else if (_.includes(["parent", "children", "ancestors"], id)) {
        return caller;
    } else {
        return null;
    }
}

export function cleanToAPIChildReferenceName(d2: D2, key: string, parent: string): string[] {
    if (key === "attributes") {
        return ["attributeValues"];
    } else if (key === "optionSets") {
        return _.compact([
            d2.models[key].name,
            d2.models[key].plural,
            parent === "dataElement" ? "commentOptionSet" : null,
        ]);
    } else if (key === parent + "Sets" && parent.endsWith("Group")) {
        return ["groupSets"];
    } else if (key === "dataApprovalWorkflow") {
        return ["workflow"];
    } else if (key === "programNotificationTemplates") {
        return ["notificationTemplates"];
    } else if (key === "organisationUnit") {
        return ["parent", "children", "ancestors"];
    } else if (isD2Model(d2, key)) {
        // Children reference name may be plural or singular
        return [d2.models[key].name, d2.models[key].plural];
    } else {
        return [key];
    }
}

export function getClassName(className: string): string | undefined {
    return _(className)
        .split(".")
        .last();
}

export async function getCurrentUserOrganisationUnits(d2: D2): Promise<string[]> {
    const response: any = await d2.currentUser.getOrganisationUnits();
    const organisationUnitsIds: string[] = [...response.valuesContainerMap.keys()];
    return organisationUnitsIds;
}
