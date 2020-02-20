import { D2Api } from "d2-api";
import _ from "lodash";
import { CategoryOptionModel, D2Model, OptionModel } from "../../models/d2Model";
import { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";

interface CombinedMetadata {
    id: string;
    name: string;
    categoryCombo: {
        categories: {
            categoryOptions: {
                id: string;
                name: string;
                shortName: string;
                code: string;
            }[];
        }[];
    };
    optionSet: {
        options: {
            id: string;
            name: string;
            shortName: string;
            code: string;
        }[];
    };
}

export const autoMap = async (
    instanceApi: D2Api,
    model: typeof D2Model,
    selectedItem: Partial<MetadataType>,
    defaultValue?: string
): Promise<MetadataMapping> => {
    const { objects } = await model
        .getApiModel(instanceApi)
        .get({
            fields: { id: true, code: true, name: true },
            filter: {
                name: { token: selectedItem.name },
                shortName: { token: selectedItem.shortName },
                id: { eq: selectedItem.id },
                code: { eq: selectedItem.code },
            },
            rootJunction: "OR",
        })
        .getData();

    const candidateWithSameId = _.find(objects, ["id", selectedItem.id]);
    const candidateWithSameCode = _.find(objects, ["code", selectedItem.code]);
    const candidate = candidateWithSameId ?? candidateWithSameCode ?? objects[0] ?? {};

    return { mappedId: candidate.id ?? defaultValue, name: candidate.name };
};

const autoMapCollection = async (
    instanceApi: D2Api,
    collection: Partial<MetadataType>[],
    model: typeof D2Model
) => {
    if (collection.length === 0) return { conflicts: false };

    const mapping: {
        [id: string]: MetadataMapping;
    } = {};
    let conflicts = false;

    for (const item of collection) {
        const candidate = await autoMap(instanceApi, model, item, "DISABLED");
        if (item.id)
            mapping[item.id] = {
                ...candidate,
                conflicts: candidate.mappedId === "DISABLED",
            };
        if (candidate.mappedId === "DISABLED") conflicts = true;
    }

    return { conflicts, mapping };
};

export const buildMapping = async (
    api: D2Api,
    instanceApi: D2Api,
    model: typeof D2Model,
    originalId: string,
    mappedId: string = ""
): Promise<MetadataMapping | undefined> => {
    if (mappedId === "DISABLED") return { mappedId: "DISABLED", conflicts: false, mapping: {} };
    const { objects } = ((await model
        .getApiModel(api)
        .get({
            fields: {
                id: true,
                name: true,
                categoryCombo: {
                    categories: {
                        categoryOptions: { id: true, name: true, shortName: true, code: true },
                    },
                },
                optionSet: { options: { id: true, name: true, shortName: true, code: true } },
            },
            filter: {
                id: {
                    eq: cleanOrgUnitPath(originalId),
                },
            },
        })
        .getData()) as unknown) as { objects: CombinedMetadata[] };
    if (objects.length !== 1) return undefined;
    const mappedElement = await autoMap(instanceApi, model, { id: mappedId }, mappedId);

    const {
        mapping: categoryOptions,
        conflicts: categoryOptionsConflicts,
    } = await autoMapCollection(
        instanceApi,
        _.flatten(
            objects[0]?.categoryCombo?.categories.map((category: any) => category.categoryOptions)
        ),
        CategoryOptionModel
    );

    const { mapping: options, conflicts: optionsConflicts } = await autoMapCollection(
        instanceApi,
        objects[0]?.optionSet?.options ?? [],
        OptionModel
    );

    const mapping = _.omitBy(
        {
            categoryOptions,
            options,
        },
        _.isUndefined
    ) as MetadataMappingDictionary;

    return {
        mappedId,
        name: mappedElement.name,
        conflicts: categoryOptionsConflicts || optionsConflicts,
        mapping,
    };
};
