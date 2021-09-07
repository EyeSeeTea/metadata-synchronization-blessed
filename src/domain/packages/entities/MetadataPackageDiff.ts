import stringify from "json-stringify-deterministic";
import _ from "lodash";
import { Id, models, Ref } from "../../../types/d2-api";
import { MetadataEntities, MetadataEntity, MetadataPackage } from "./../../metadata/entities/MetadataEntities";

export interface MetadataPackageDiff {
    baseMetadata: MetadataPackage;
    mergeableMetadata: MetadataPackage;
    hasChanges: boolean;
    changes: Record<string, ModelDiff>;
}

export interface ModelDiff {
    hasChanges: boolean;
    total: number;
    unmodified: Obj[];
    created: Obj[];
    updates: ObjUpdate[];
}

export type ModelKey = keyof MetadataEntities;
export type Obj = Ref & Record<string, string | undefined>;
export type FieldUpdate = { field: string; oldValue: string; newValue: string };
export type ObjUpdate = { obj: Obj; fieldsUpdated: FieldUpdate[] };

const ignoredFields = ["created", "lastUpdated", "lastUpdatedBy", "version"] as const;

export function getMetadataPackageDiff(
    baseMetadata: MetadataPackage,
    mergeableMetadata: MetadataPackage
): MetadataPackageDiff {
    const modelKeys = _.union(_.keys(baseMetadata), _.keys(mergeableMetadata)) as ModelKey[];
    const changes = getChanges(modelKeys, baseMetadata, mergeableMetadata);
    const hasChanges = _(changes)
        .values()
        .some(modelDiff => modelDiff.hasChanges);
    return { hasChanges, changes: changes, baseMetadata, mergeableMetadata };
}

function getChanges(
    modelKeys: ModelKey[],
    baseMetadata: MetadataPackage,
    mergeableMetadata: MetadataPackage
): MetadataPackageDiff["changes"] {
    const metadataDiffPairs = modelKeys.map(modelKey => {
        const baseObjects = getObjectsWithStringValues(baseMetadata, modelKey);
        const mergeableObjects = getObjectsWithStringValues(mergeableMetadata, modelKey);
        const mergableObjectsById = _.keyBy(mergeableObjects, getId);
        const updatedObjs = _.intersectionBy(baseObjects, mergeableObjects, getId);
        const createdObjs = _.differenceBy(mergeableObjects, baseObjects, getId);

        const updates: ObjUpdate[] = _.compact(
            updatedObjs.map(baseObj => {
                const mergeableObject = _(mergableObjectsById).get(baseObj.id, null);
                if (!mergeableObject) return null;
                const fields = _.keys(baseObj);
                const fieldsUpdated: FieldUpdate[] = _(fields)
                    .without(...ignoredFields)
                    .map(field => {
                        const oldValue = baseObj[field] || "";
                        const newValue = mergeableObject[field] || "";
                        const valueChanged = oldValue !== newValue;
                        return valueChanged ? { field, oldValue, newValue } : null;
                    })
                    .compact()
                    .value();
                return { obj: baseObj, fieldsUpdated };
            })
        );

        const [unmodified, updated] = _.partition(updates, u => _.isEmpty(u.fieldsUpdated));
        const unmodifiedObjs = unmodified.map(u => u.obj);
        const metadataModelDiff: ModelDiff = {
            hasChanges: unmodified.length !== mergeableObjects.length,
            total: mergeableObjects.length,
            unmodified: unmodifiedObjs,
            created: createdObjs,
            updates: updated,
        };

        return [getModelTitle(modelKey), metadataModelDiff];
    });

    return _.fromPairs(metadataDiffPairs) as MetadataPackageDiff["changes"];
}

function getModelTitle(modelKey: ModelKey) {
    const schema = _(models).get(modelKey, null);
    const modelPluralName = schema ? _.startCase(models[modelKey].displayName) : modelKey;
    return modelPluralName;
}

function getObjectsWithStringValues(metadata: MetadataPackage, modelKey: ModelKey): Obj[] {
    const objects = metadata[modelKey] || [];
    return objects.map(obj => _.mapValues(obj, getStringValue));
}

type AttributeValue = MetadataEntity[keyof MetadataEntity];

function getStringValue(value: AttributeValue): string {
    switch (typeof value) {
        case "string":
        case "number":
        case "boolean":
            return value.toString();
        case "object":
            if (!value) {
                return "NULL";
            } else if (Array.isArray(value)) {
                // On arrays, remove the ignored fields and apply a simple, best-effort sorting
                // so the same items in different order are considered equal.
                return stringify(
                    _(value as Obj[])
                        .map(obj => _.omit(obj, ignoredFields))
                        .sortBy(obj => obj.id || stringify(obj))
                        .value()
                );
            } else {
                return stringify(value);
            }
        default:
            return "NULL";
    }
}

function getId<T extends Ref>(obj: T): Id {
    return obj.id;
}
