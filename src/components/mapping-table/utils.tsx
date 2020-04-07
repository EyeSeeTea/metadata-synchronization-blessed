import { D2Api } from "d2-api";
import _ from "lodash";
import { D2Model } from "../../models/dhis/default";
import { EventProgramModel } from "../../models/dhis/mapping";
import { CategoryOptionModel, OptionModel, ProgramStageModel } from "../../models/dhis/metadata";
import { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath, getDefaultIds } from "../../utils/synchronization";

export const EXCLUDED_KEY = "DISABLED";

interface CombinedMetadata {
    id: string;
    name?: string;
    shortName?: string;
    code?: string;
    path?: string;
    level?: number;
    categoryCombo?: {
        id: string;
        name: string;
        categories: {
            categoryOptions: {
                id: string;
                name: string;
                shortName: string;
                code: string;
            }[];
        }[];
    };
    optionSet?: {
        options: {
            id: string;
            name: string;
            shortName: string;
            code: string;
        }[];
    };
    commentOptionSet?: {
        options: {
            id: string;
            name: string;
            shortName: string;
            code: string;
        }[];
    };
    programStages?: {
        id: string;
        name: string;
        programStageDataElements?: {
            dataElement: {
                id: string;
            };
        }[];
    }[];
}

export const cleanNestedMappedId = (id: string): string => {
    return (
        _(id)
            .split("-")
            .last() ?? ""
    );
};

const getFieldsByModel = (model: typeof D2Model) => {
    switch (model.getCollectionName()) {
        case "organisationUnits":
            return {
                path: true,
                level: true,
            };
        case "dataElements":
            return {
                categoryCombo: {
                    id: true,
                    name: true,
                    categories: {
                        categoryOptions: { id: true, name: true, shortName: true, code: true },
                    },
                },
                optionSet: { options: { id: true, name: true, shortName: true, code: true } },
                commentOptionSet: {
                    options: { id: true, name: true, shortName: true, code: true },
                },
            };
        case "programs":
            return {
                categoryCombo: {
                    id: true,
                    name: true,
                    categories: {
                        categoryOptions: { id: true, name: true, shortName: true, code: true },
                    },
                },
                programStages: {
                    id: true,
                    name: true,
                    programStageDataElements: { dataElement: { id: true } },
                },
            };
        default:
            return {};
    }
};

const getCombinedMetadata = async (api: D2Api, model: typeof D2Model, id: string) => {
    const { objects } = ((await model
        .getApiModel(api)
        .get({
            fields: {
                id: true,
                name: true,
                code: true,
                ...getFieldsByModel(model),
            },
            filter: {
                id: {
                    eq: cleanOrgUnitPath(id),
                },
            },
        })
        .getData()) as unknown) as { objects: CombinedMetadata[] };

    return objects;
};

export const autoMap = async ({
    api,
    instanceApi,
    originModel,
    destinationModel,
    selectedItemId,
    defaultValue,
    filter,
}: {
    api: D2Api;
    instanceApi: D2Api;
    originModel: typeof D2Model;
    destinationModel: typeof D2Model;
    selectedItemId: string;
    defaultValue?: string;
    filter?: string[];
}): Promise<MetadataMapping[]> => {
    const selectedItem = _.first(
        (
            await originModel
                .getApiModel(api)
                .get({
                    fields: { id: true, code: true, name: true, shortName: true },
                    filter: { id: { eq: cleanNestedMappedId(cleanOrgUnitPath(selectedItemId)) } },
                })
                .getData()
        ).objects
    ) as CombinedMetadata | undefined;
    if (!selectedItem) return [];

    const { objects } = (await destinationModel
        .getApiModel(instanceApi)
        .get({
            fields: { id: true, code: true, name: true, path: true, level: true },
            filter: {
                name: { token: selectedItem.name },
                shortName: { token: selectedItem.shortName },
                id: { eq: selectedItem.id },
                code: { eq: selectedItem.code },
            },
            rootJunction: "OR",
        })
        .getData()) as { objects: CombinedMetadata[] };

    const candidateWithSameId = _.find(objects, ["id", selectedItem.id]);
    const candidateWithSameCode = _.find(objects, ["code", selectedItem.code]);
    const candidateWithSameName = _.find(objects, ["name", selectedItem.name]);
    const candidates = _([
        candidateWithSameId,
        candidateWithSameCode,
        candidateWithSameName,
        ...objects,
    ])
        .compact()
        .uniq()
        .filter(({ id }) => filter?.includes(id) ?? true)
        .value();

    if (candidates.length === 0 && defaultValue) {
        candidates.push({ id: defaultValue, code: defaultValue });
    }

    return _.sortBy(candidates, ["level"]).map(({ id, path, name, code, level }) => ({
        mappedId: path ?? id,
        mappedName: name,
        mappedCode: code,
        mappedLevel: level,
        code: selectedItem.code,
        global: false,
    }));
};

const autoMapCollection = async (
    api: D2Api,
    instanceApi: D2Api,
    originMetadata: CombinedMetadata[],
    model: typeof D2Model,
    destinationMetadata: CombinedMetadata[]
) => {
    if (originMetadata.length === 0) return {};
    const filter = _.compact(destinationMetadata.map(({ id }) => id));

    const mapping: {
        [id: string]: MetadataMapping;
    } = {};

    for (const item of originMetadata) {
        const [candidate] = await autoMap({
            api,
            instanceApi,
            originModel: model,
            destinationModel: model,
            selectedItemId: item.id,
            defaultValue: EXCLUDED_KEY,
            filter,
        });
        if (item.id && candidate) {
            mapping[item.id] = {
                ...candidate,
                conflicts: candidate.mappedId === EXCLUDED_KEY,
            };
        }
    }

    return mapping;
};

const getCategoryOptions = (object: CombinedMetadata) => {
    return _.flatten(
        object.categoryCombo?.categories.map(({ categoryOptions }) => categoryOptions)
    );
};

const getOptions = (object: CombinedMetadata) => {
    return _.union(object.optionSet?.options, object.commentOptionSet?.options);
};

const getProgramStages = (object: CombinedMetadata) => {
    return object.programStages ?? [];
};

const getProgramStageDataElements = (object: CombinedMetadata) => {
    return _.compact(
        _.flatten(
            object.programStages?.map(({ programStageDataElements }) =>
                programStageDataElements?.map(({ dataElement }) => dataElement)
            )
        )
    );
};

const autoMapCategoryCombo = (
    originMetadata: CombinedMetadata,
    destinationMetadata: CombinedMetadata
) => {
    if (originMetadata.categoryCombo) {
        const { id } = originMetadata.categoryCombo;
        const { id: mappedId = EXCLUDED_KEY, name: mappedName } =
            destinationMetadata.categoryCombo ?? {};

        return {
            [id]: {
                mappedId,
                mappedName,
                mapping: {},
                conflicts: false,
            },
        };
    } else {
        return {};
    }
};

const autoMapProgramStages = async (
    api: D2Api,
    instanceApi: D2Api,
    originMetadata: CombinedMetadata,
    destinationMetadata: CombinedMetadata
) => {
    const originProgramStages = getProgramStages(originMetadata);
    const destinationProgramStages = getProgramStages(destinationMetadata);

    if (originProgramStages.length === 1 && destinationProgramStages.length === 1) {
        return {
            [originProgramStages[0].id]: {
                mappedId: destinationProgramStages[0].id,
                mappedName: destinationProgramStages[0].name,
                conflicts: false,
                mapping: {},
            },
        };
    } else {
        return autoMapCollection(
            api,
            instanceApi,
            originProgramStages,
            ProgramStageModel,
            destinationProgramStages
        );
    }
};

export const buildMapping = async ({
    api,
    instanceApi,
    originModel,
    destinationModel,
    originalId,
    mappedId = "",
}: {
    api: D2Api;
    instanceApi: D2Api;
    originModel: typeof D2Model;
    destinationModel: typeof D2Model;
    originalId: string;
    mappedId?: string;
}): Promise<MetadataMapping> => {
    const originMetadata = await getCombinedMetadata(api, originModel, originalId);
    if (mappedId === EXCLUDED_KEY)
        return {
            mappedId: EXCLUDED_KEY,
            mappedCode: EXCLUDED_KEY,
            code: originMetadata[0]?.code,
            conflicts: false,
            global: false,
            mapping: {},
        };

    const destinationMetadata = await getCombinedMetadata(instanceApi, destinationModel, mappedId);
    if (originMetadata.length !== 1 || destinationMetadata.length !== 1) return {};

    const [mappedElement] = destinationMetadata.map(({ id, path, name, code, level }) => ({
        mappedId: path ?? id,
        mappedName: name,
        mappedCode: code,
        mappedLevel: level,
        code: originMetadata[0].code,
    }));

    const categoryCombos = autoMapCategoryCombo(originMetadata[0], destinationMetadata[0]);

    const categoryOptions = await autoMapCollection(
        api,
        instanceApi,
        getCategoryOptions(originMetadata[0]),
        CategoryOptionModel,
        getCategoryOptions(destinationMetadata[0])
    );

    const options = await autoMapCollection(
        api,
        instanceApi,
        getOptions(originMetadata[0]),
        OptionModel,
        getOptions(destinationMetadata[0])
    );

    const programStages = await autoMapProgramStages(
        api,
        instanceApi,
        originMetadata[0],
        destinationMetadata[0]
    );

    const mapping = _.omitBy(
        {
            categoryCombos,
            categoryOptions,
            options,
            programStages,
        },
        _.isEmpty
    ) as MetadataMappingDictionary;

    return {
        ...mappedElement,
        conflicts: false,
        global: false,
        mapping,
    };
};

export const getValidIds = async (
    api: D2Api,
    model: typeof D2Model,
    id: string
): Promise<string[]> => {
    const combinedMetadata = await getCombinedMetadata(api, model, id);
    if (combinedMetadata.length === 0) return [];

    const categoryOptions = getCategoryOptions(combinedMetadata[0]);
    const options = getOptions(combinedMetadata[0]);
    const programStages = getProgramStages(combinedMetadata[0]);
    const programStageDataElements = getProgramStageDataElements(combinedMetadata[0]);
    const defaultValues = await getDefaultIds(api);

    return _.union(categoryOptions, options, programStages, programStageDataElements)
        .map(({ id }) => id)
        .concat(...defaultValues);
};

export const getChildrenRows = (rows: MetadataType[], model: typeof D2Model): MetadataType[] => {
    const childrenKeys = model.getChildrenKeys() ?? [];

    return _.flattenDeep(
        rows.map(row => Object.values(_.pick(row, childrenKeys)) as MetadataType[])
    );
};

export const buildDataElementFilterForProgram = async (
    api: D2Api,
    nestedId: string,
    mapping: MetadataMappingDictionary
): Promise<string[] | undefined> => {
    const mappingType = EventProgramModel.getMappingType();
    if (!mappingType) return undefined;

    const originProgramId = nestedId.split("-")[0];
    const { mappedId } = _.get(mapping, ["eventPrograms", originProgramId]) ?? {};

    if (!mappedId || mappedId === EXCLUDED_KEY) return undefined;
    const validIds = await getValidIds(api, EventProgramModel, mappedId);
    return [...validIds, mappedId];
};
