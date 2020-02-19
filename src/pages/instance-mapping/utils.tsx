import { D2Api, D2ModelSchemas } from "d2-api";
import _ from "lodash";
import Instance, { MetadataMapping } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";

export const autoMap = async (
    instance: Instance,
    type: keyof D2ModelSchemas,
    selectedItem: Partial<MetadataType>,
    defaultValue?: string
): Promise<MetadataMapping> => {
    const api = instance.getApi();
    const { objects } = await api.models[type]
        //@ts-ignore Fix in d2-api
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
    instance: Instance,
    collection: MetadataType[],
    type: keyof D2ModelSchemas
) => {
    const mapping: {
        [id: string]: MetadataMapping;
    } = {};
    let conflicts = false;

    for (const item of collection) {
        const candidate = await autoMap(instance, type, item, "DISABLED");
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
    instance: Instance,
    type: keyof D2ModelSchemas,
    originalId: string,
    mappedId: string
): Promise<MetadataMapping | undefined> => {
    if (mappedId === "DISABLED") return { mappedId: "DISABLED", conflicts: false, mapping: {} };
    const { objects } = (await api.models[type]
        //@ts-ignore Fix in d2-api
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
        .getData()); // TODO: Properly type metadata endpoint
    if (objects.length !== 1) return undefined;
    const mappedElement = await autoMap(instance, type, { id: mappedId }, mappedId);

    const {
        mapping: categoryOptions,
        conflicts: categoryOptionsConflicts,
    } = await autoMapCollection(
        instance,
        _.flatten(
            objects[0]?.categoryCombo?.categories.map((category: any) => category.categoryOptions)
        ),
        "categoryOptions"
    );

    const { mapping: options, conflicts: optionsConflicts } = await autoMapCollection(
        instance,
        objects[0]?.optionSet?.options ?? [],
        "options"
    );

    return {
        mappedId,
        name: mappedElement.name,
        conflicts: categoryOptionsConflicts || optionsConflicts,
        mapping: {
            categoryOptions,
            options,
        },
    };
};
