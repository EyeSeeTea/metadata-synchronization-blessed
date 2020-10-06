import { D2SchemaProperties } from "d2-api/schemas";
import { isValidUid } from "d2/uid";
import _ from "lodash";
import { D2Api } from "../../types/d2-api";
import { NestedRules } from "../../types/synchronization";
import { MetadataEntities } from "./entities/MetadataEntities";

const blacklistedProperties = ["access"];
const userProperties = ["user", "userAccesses", "userGroupAccesses"];

export function buildNestedRules(rules: string[][] = []): NestedRules {
    return _(rules)
        .filter(path => path.length > 1)
        .groupBy(_.first)
        .mapValues(path => path.map(_.tail))
        .value();
}

/**
 * Clean object to sync of dirty references
 * (blacklistedProperties, userProperties if required and references in exclude rules)
 */
export function cleanObject(
    api: D2Api,
    modelName: string,
    element: any,
    excludeRules: string[][] = [],
    includeSharingSettings: boolean,
    removeOrgUnitReferences: boolean
): any {
    const leafRules: string[] = _(excludeRules)
        .filter(path => path.length === 1)
        .map(_.first)
        .compact()
        .value();

    const cleanLeafRules = leafRules.reduce(
        (accumulator: string[], rule: string) => [
            ...accumulator,
            ...cleanToAPIChildReferenceName(api, rule, modelName),
        ],
        []
    );

    const sharingSettingsFilter = includeSharingSettings ? [] : userProperties;
    const organisationUnitFilter = removeOrgUnitReferences ? ["organisationUnits"] : [];
    const propsToRemove = [...sharingSettingsFilter, ...organisationUnitFilter];

    return _.pick(
        element,
        _.difference(_.keys(element), cleanLeafRules, blacklistedProperties, propsToRemove)
    );
}

export function cleanReferences(
    references: Record<string, string[]>,
    includeRules: string[][] = []
): string[] {
    const rules = _(includeRules).map(_.first).compact().value();

    return _.intersection(_.keys(references), rules);
}

export function getAllReferences(
    api: D2Api,
    obj: any,
    type: string,
    parents: string[] = []
): Record<string, string[]> {
    let result: Record<string, string[]> = {};
    _.forEach(obj, (value, key) => {
        if (_.isObject(value) || _.isArray(value)) {
            const recursive = getAllReferences(api, value, type, [...parents, key]);
            result = _.deepMerge(result, recursive);
        } else if (isValidUid(value)) {
            const metadataType = _(parents)
                .map(k => cleanToModelName(api, k, type))
                .compact()
                .first();
            if (metadataType) {
                result[metadataType] = result[metadataType] || [];
                result[metadataType].push(value);
            }
        }
    });
    return result;
}

export function getSchemaByName(api: D2Api, modelName: string): D2SchemaProperties | undefined {
    const model = _.values(api.models).find(
        ({ schema }) => schema.name === modelName || schema.plural === modelName
    );
    return model?.schema;
}

export function getSchemaByKlass(api: D2Api, klass: string): D2SchemaProperties | undefined {
    const model = _.values(api.models).find(({ schema }) => schema.klass === klass);
    return model?.schema;
}

export function isValidModel(api: D2Api, modelName: string): boolean {
    const { metadata = false } = getSchemaByName(api, modelName) ?? {};
    return metadata;
}

export function getSchemaByModelField(
    api: D2Api,
    field: string,
    caller: string
): D2SchemaProperties | undefined {
    const callerSchema = getSchemaByName(api, caller);
    const fieldProperty = callerSchema?.properties.find(({ fieldName }) => fieldName === field);
    if (!fieldProperty) return undefined;

    return getSchemaByKlass(api, fieldProperty.itemKlass ?? fieldProperty.klass);
}

/**
 * Return expected model in plural to include as key in post metadata body
 */
export function cleanToModelName(api: D2Api, id: string, caller?: string): string | null {
    if (isValidModel(api, id)) {
        const schema = getSchemaByName(api, id);
        return schema?.plural ?? id;
    } else if (id === "dataSetElements") {
        return "dataElements";
    } else if (id === "programStageDataElements") {
        return "dataElements";
    } else if (id === "attributeValues") {
        return "attributes";
    } else if (id === "commentOptionSet") {
        return "optionSets";
    } else if (id === "groupSets" && caller?.endsWith("Group")) {
        return caller + "Sets";
    } else if (id === "workflow") {
        return "dataApprovalWorkflow";
    } else if (id === "notificationTemplates") {
        return "programNotificationTemplates";
    } else if (caller) {
        const callerSchema = getSchemaByModelField(api, id, caller);
        return callerSchema?.collectionName ?? null;
    } else {
        return null;
    }
}

/**
 * Return expected posible children keys for metadata models
 */
export function cleanToAPIChildReferenceName(api: D2Api, key: string, parent: string): string[] {
    if (key === "attributes") {
        return ["attributeValues"];
    } else if (key === "optionSets") {
        return _.compact([
            api.models[key].schema.name,
            api.models[key].schema.plural,
            parent === "dataElement" ? "commentOptionSet" : null,
        ]);
    } else if (key === parent + "Sets" && parent.endsWith("Group")) {
        return ["groupSets"];
    } else if (key === "dataApprovalWorkflow") {
        return ["workflow"];
    } else if (key === "programNotificationTemplates") {
        return ["notificationTemplates"];
    } else if (isValidModel(api, key)) {
        // Children reference name may be plural or singular
        return [
            api.models[key as keyof MetadataEntities].schema.name,
            api.models[key as keyof MetadataEntities].schema.plural,
        ];
    } else {
        return [key];
    }
}

export function getClassName(className: string): string | undefined {
    return _(className).split(".").last();
}
