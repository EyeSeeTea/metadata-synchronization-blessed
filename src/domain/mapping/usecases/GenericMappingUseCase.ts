import _ from "lodash";
import {
    cleanNestedMappedId,
    EXCLUDED_KEY,
} from "../../../presentation/react/core/components/mapping-table/utils";
import { Dictionary } from "../../../types/utils";
import { NamedRef } from "../../common/entities/Ref";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { MetadataMapping, MetadataMappingDictionary } from "../entities/MetadataMapping";

export abstract class GenericMappingUseCase {
    constructor(private repositoryFactory: RepositoryFactory, protected localInstance: Instance) {}

    protected async getMetadata(instance: DataSource, ids: string[]) {
        return this.repositoryFactory
            .metadataRepository(instance)
            .getMetadataByIds<Omit<CombinedMetadata, "model">>(ids, fields, true);
    }

    protected createMetadataDictionary(metadata: MetadataPackage<NamedRef>) {
        return _.transform(
            metadata,
            (result, value = [], model) => {
                for (const item of value) {
                    if (item.id) {
                        result[item.id] = { ...item, model };
                    }
                }
            },
            {} as Dictionary<CombinedMetadata>
        );
    }

    protected createMetadataArray(metadata: MetadataPackage<NamedRef>) {
        const dictionary = this.createMetadataDictionary(metadata);
        return _.values(dictionary);
    }

    protected async buildMapping({
        metadata,
        originInstance,
        destinationInstance,
        originalId,
        mappedId = "",
    }: {
        metadata: Record<string, CombinedMetadata>;
        originInstance: DataSource;
        destinationInstance: DataSource;
        originalId: string;
        mappedId?: string;
    }): Promise<MetadataMapping> {
        const originMetadata = metadata[originalId];
        if (mappedId === EXCLUDED_KEY)
            return {
                mappedId: EXCLUDED_KEY,
                mappedCode: EXCLUDED_KEY,
                code: originMetadata?.code,
                conflicts: false,
                global: false,
                mapping: {},
            };

        const metadataResponse = await this.getMetadata(destinationInstance, [mappedId]);
        const destinationMetadata = this.createMetadataDictionary(metadataResponse);
        const destinationItem = destinationMetadata[mappedId];
        if (!originMetadata || !destinationItem) return {};

        const defaultOriginCategoryOptionCombo = await this.repositoryFactory
            .metadataRepository(originInstance)
            .getDefaultIds("categoryOptionCombos");

        const defaultDestinationCategoryOptionCombo = await this.repositoryFactory
            .metadataRepository(destinationInstance)
            .getDefaultIds("categoryOptionCombos");

        const mappedElement = {
            mappedId: destinationItem.path ?? destinationItem.id,
            mappedName: destinationItem.name,
            mappedCode: destinationItem.code,
            mappedLevel: destinationItem.level,
            code: originMetadata.code,
        };

        const categoryCombos = this.autoMapCategoryCombo(originMetadata, destinationItem);

        const categoryOptions = await this.autoMapCollection(
            destinationInstance,
            this.getCategoryOptions(originMetadata),
            this.getCategoryOptions(destinationItem)
        );

        const categoryOptionCombos = await this.autoMapCollection(
            destinationInstance,
            this.getCategoryOptionCombos(originMetadata, defaultOriginCategoryOptionCombo[0]),
            this.getCategoryOptionCombos(destinationItem, defaultDestinationCategoryOptionCombo[0])
        );

        const options = await this.autoMapCollection(
            destinationInstance,
            this.getOptions(originMetadata),
            this.getOptions(destinationItem)
        );

        const programStages = await this.autoMapProgramStages(
            destinationInstance,
            originMetadata,
            destinationItem
        );

        const mapping = _.omitBy(
            {
                categoryOptionCombos,
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
    }

    protected async getValidMappingIds(instance: DataSource, id: string): Promise<string[]> {
        const metadataResponse = await this.getMetadata(instance, [id]);
        const metadata = this.createMetadataArray(metadataResponse);
        if (metadata.length === 0) return [];

        const categoryOptions = this.getCategoryOptions(metadata[0]);
        const categoryOptionCombos = this.getCategoryOptionCombos(metadata[0]);
        const options = this.getOptions(metadata[0]);
        const programStages = this.getProgramStages(metadata[0]);
        const programStageDataElements = this.getProgramStageDataElements(metadata[0]);

        const defaultValues = await this.repositoryFactory
            .metadataRepository(instance)
            .getDefaultIds();

        return _.union(
            categoryOptions,
            categoryOptionCombos,
            options,
            programStages,
            programStageDataElements
        )
            .map(({ id }) => id)
            .concat(...defaultValues)
            .map(cleanNestedMappedId);
    }

    protected async autoMap({
        destinationInstance,
        selectedItem,
        defaultValue,
        filter,
    }: {
        destinationInstance: DataSource;
        selectedItem: { id: string; name: string; code?: string };
        defaultValue?: string;
        filter?: string[];
    }): Promise<MetadataMapping[]> {
        const destinationMetadata = await this.repositoryFactory
            .metadataRepository(destinationInstance)
            .lookupSimilar(selectedItem);

        const objects = _(destinationMetadata)
            .omit(["indicators", "programIndicators"])
            .values()
            .flatMap(item => (Array.isArray(item) ? item : []))
            .value();

        const candidateWithSameId = _.find(objects, ["id", selectedItem.id]);
        const candidateWithSameCode = _.find(objects, ["code", selectedItem.code]);
        const candidateWithSameName = _.find(objects, ["name", selectedItem.name]);
        const matches = _.compact([
            candidateWithSameId,
            candidateWithSameCode,
            candidateWithSameName,
        ]).filter(({ id }) => filter?.includes(id) ?? true);

        const candidates = _(matches)
            .concat(matches.length === 0 ? objects : [])
            .uniqBy("id")
            .filter(({ id }) => filter?.includes(id) ?? true)
            .value();

        if (candidates.length === 0 && defaultValue) {
            candidates.push({ id: defaultValue, name: "", code: defaultValue });
        }

        return _.sortBy(candidates, ["level"]).map(({ id, path, name, code, level }) => ({
            mappedId: path ?? id,
            mappedName: name,
            mappedCode: code,
            mappedLevel: level,
            code: selectedItem.code,
            global: false,
        }));
    }

    protected async autoMapCollection(
        destinationInstance: DataSource,
        originMetadata: CombinedMetadata[],
        destinationMetadata: CombinedMetadata[]
    ) {
        if (originMetadata.length === 0) return {};
        const filter = _.compact(destinationMetadata.map(({ id }) => cleanNestedMappedId(id)));

        const mapping: {
            [id: string]: MetadataMapping;
        } = {};

        for (const item of originMetadata) {
            const [candidate] = await this.autoMap({
                destinationInstance,
                selectedItem: { ...item, id: cleanNestedMappedId(item.id) },
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
    }

    protected async autoMapProgramStages(
        destinationInstance: DataSource,
        originMetadata: CombinedMetadata,
        destinationMetadata: CombinedMetadata
    ) {
        const originProgramStages = this.getProgramStages(originMetadata);
        const destinationProgramStages = this.getProgramStages(destinationMetadata);

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
            return this.autoMapCollection(
                destinationInstance,
                originProgramStages,
                destinationProgramStages
            );
        }
    }

    protected getCategoryOptions(object: CombinedMetadata) {
        // TODO: This method should properly validate original model from object
        if (["categoryOptionCombos"].includes(object.model)) return [];

        return _.flatten(
            object.categoryCombo?.categories?.map(({ id: category, categoryOptions }) =>
                categoryOptions.map(({ id, ...rest }) => ({
                    id: `${category}-${id}`,
                    model: "categoryOptions",
                    ...rest,
                }))
            )
        );
    }

    protected getOptions(object: CombinedMetadata) {
        return _.union(object.optionSet?.options, object.commentOptionSet?.options).map(item => ({
            ...item,
            model: "options",
        }));
    }

    protected autoMapCategoryCombo(
        originMetadata: CombinedMetadata,
        destinationMetadata: CombinedMetadata
    ) {
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
    }

    protected getProgramStages(object: CombinedMetadata) {
        return object.programStages?.map(item => ({ ...item, model: "programStages" })) ?? [];
    }

    protected getCategoryOptionCombos(
        object: CombinedMetadata,
        defaultCoc = "default"
    ): CombinedMetadata[] {
        switch (object.model) {
            case "indicators":
            case "programIndicators": {
                const { aggregateExportCategoryOptionCombo = defaultCoc } = object;
                return _([_.last(aggregateExportCategoryOptionCombo.split("."))])
                    .compact()
                    .map(id => ({
                        id,
                        model: "categoryOptionCombos",
                        name: "",
                    }))
                    .value();
            }
            case "dataElements": {
                return (
                    object.categoryCombo?.categoryOptionCombos.map(({ id, name }) => ({
                        id,
                        name,
                        model: "categoryOptionCombos",
                    })) ?? []
                );
            }
            default: {
                return [];
            }
        }
    }

    protected getProgramStageDataElements(object: CombinedMetadata) {
        return _.compact(
            _.flatten(
                object.programStages?.map(({ programStageDataElements }) =>
                    programStageDataElements?.map(({ dataElement }) => dataElement)
                )
            )
        );
    }
}

interface CombinedMetadata {
    id: string;
    model: string;
    name: string;
    shortName?: string;
    code?: string;
    path?: string;
    level?: number;
    categoryCombo?: {
        id: string;
        name: string;
        categories: {
            id: string;
            categoryOptions: {
                id: string;
                name: string;
                shortName: string;
                code: string;
            }[];
        }[];
        categoryOptionCombos: { id: string; name: string }[];
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
    aggregateExportCategoryOptionCombo?: string;
}

const fields = {
    id: true,
    name: true,
    code: true,
    path: true,
    level: true,
    categoryCombo: {
        id: true,
        name: true,
        categories: {
            id: true,
            categoryOptions: { id: true, name: true, shortName: true, code: true },
        },
        categoryOptionCombos: { id: true, name: true },
    },
    aggregateExportCategoryOptionCombo: true,
    optionSet: { options: { id: true, name: true, shortName: true, code: true } },
    commentOptionSet: {
        options: { id: true, name: true, shortName: true, code: true },
    },
    programStages: {
        id: true,
        name: true,
        programStageDataElements: { dataElement: { id: true } },
    },
};
