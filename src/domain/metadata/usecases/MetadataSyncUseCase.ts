import _ from "lodash";
import memoize from "nano-memoize";
import { modelFactory } from "../../../models/dhis/factory";
import { ExportBuilder, NestedRules } from "../../../types/synchronization";
import { promiseMap } from "../../../utils/common";
import { debug } from "../../../utils/debug";
import { Expression, ExpressionParser } from "../../../utils/expressionParser";
import { mapCategoryOptionCombo } from "../../../utils/synchronization";
import { Ref } from "../../common/entities/Ref";
import { Instance } from "../../instance/entities/Instance";
import {
    MetadataMapping,
    MetadataMappingDictionary,
} from "../../instance/entities/MetadataMapping";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import {
    CategoryOptionCombo,
    Indicator,
    MetadataEntities,
    MetadataPackage,
} from "../entities/MetadataEntities";
import {
    buildNestedRules,
    cleanObject,
    cleanReferences,
    cleanToModelName,
    getAllReferences,
} from "../utils";

export class MetadataSyncUseCase extends GenericSyncUseCase {
    public readonly type = "metadata";

    public async exportMetadata(originalBuilder: ExportBuilder): Promise<MetadataPackage> {
        const visitedIds: Set<string> = new Set();
        const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
            const { type, ids, excludeRules, includeRules, includeSharingSettings } = builder;

            //TODO: when metadata entities schema exists on domain, move this factory to domain
            const collectionName = modelFactory(this.api, type).getCollectionName();
            const schema = this.api.models[collectionName].schema;
            const result: MetadataPackage = {};

            // Each level of recursion traverse the exclude/include rules with nested values
            const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
            const nestedIncludeRules: NestedRules = buildNestedRules(includeRules);

            // Get all the required metadata
            const metadataRepository = await this.getMetadataRepository();
            const syncMetadata = await metadataRepository.getMetadataByIds(ids);
            const elements = syncMetadata[collectionName] || [];

            for (const element of elements) {
                // Store metadata object in result
                const object = cleanObject(
                    this.api,
                    schema.name,
                    element,
                    excludeRules,
                    includeSharingSettings
                );

                result[collectionName] = result[collectionName] || [];
                result[collectionName]?.push(object);

                // Get all the referenced metadata
                const references = getAllReferences(this.api, object, schema.name);
                const includedReferences = cleanReferences(references, includeRules);
                const promises = includedReferences
                    .map(type => ({
                        type: type as keyof MetadataEntities,
                        ids: references[type].filter(id => !visitedIds.has(id)),
                        excludeRules: nestedExcludeRules[type],
                        includeRules: nestedIncludeRules[type],
                        includeSharingSettings,
                    }))
                    .map(newBuilder => {
                        newBuilder.ids.forEach(id => {
                            visitedIds.add(id);
                        });
                        return recursiveExport(newBuilder);
                    });
                const promisesResult: MetadataPackage[] = await Promise.all(promises);
                _.deepMerge(result, ...promisesResult);
            }

            // Clean up result from duplicated elements
            return _.mapValues(result, objects => _.uniqBy(objects, "id"));
        };
        return recursiveExport(originalBuilder);
    }

    public buildPayload = memoize(async () => {
        const { metadataIds, syncParams } = this.builder;
        const {
            includeSharingSettings = true,
            metadataIncludeExcludeRules = {},
            useDefaultIncludeExclude = {},
        } = syncParams ?? {};

        const metadataRepository = await this.getMetadataRepository();
        const metadata = await metadataRepository.getMetadataByIds<Ref>(metadataIds, "id");

        const exportResults = await promiseMap(_.keys(metadata), type => {
            const myClass = modelFactory(this.api, type);
            const metadataType = myClass.getMetadataType();

            const metadatatype = type as keyof MetadataEntities;

            return this.exportMetadata({
                type: metadatatype,
                ids: metadata[metadatatype]?.map(e => e.id) || [],
                excludeRules: useDefaultIncludeExclude
                    ? myClass.getExcludeRules()
                    : metadataIncludeExcludeRules[metadataType].excludeRules.map(_.toPath),
                includeRules: useDefaultIncludeExclude
                    ? myClass.getIncludeRules()
                    : metadataIncludeExcludeRules[metadataType].includeRules.map(_.toPath),
                includeSharingSettings,
            });
        });

        const metadataPackage: MetadataPackage = _.deepMerge({}, ...exportResults);
        const metadataWithoutDuplicates: MetadataPackage = _.mapValues(metadataPackage, elements =>
            _.uniqBy(elements, "id")
        );

        return metadataWithoutDuplicates;
    });

    public async postPayload(instance: Instance): Promise<SynchronizationResult[]> {
        const { syncParams } = this.builder;

        const payloadPackage = await this.buildPayload();
        const mappedPayloadPackage = syncParams?.enableMapping
            ? await this.mapPayload(instance, payloadPackage)
            : payloadPackage;

        debug("Metadata package", { payloadPackage, mappedPayloadPackage });

        const remoteMetadataRepository = await this.getMetadataRepository(instance);
        const syncResult = await remoteMetadataRepository.save(mappedPayloadPackage, syncParams);
        const origin = await this.getOriginInstance();

        return [{ ...syncResult, origin: origin.toPublicObject() }];
    }

    public async buildDataStats() {
        return undefined;
    }

    public async mapPayload(
        instance: Instance,
        payload: MetadataPackage
    ): Promise<MetadataPackage> {
        const instanceRepository = await this.getInstanceRepository();
        const remoteInstanceRepository = await this.getInstanceRepository(instance);

        const originCategoryOptionCombos = await instanceRepository.getCategoryOptionCombos();
        const destinationCategoryOptionCombos = await remoteInstanceRepository.getCategoryOptionCombos();
        const mapping = await this.getMapping(instance);

        return _.mapValues(payload, (items, model) => {
            const collectionName = modelFactory(this.api, model).getCollectionName();
            const properties = _.keyBy(
                this.api.models[collectionName]?.schema.properties,
                "fieldName"
            );

            return items?.map((object: any) => {
                if (typeof object !== "object") return object;

                const mappedObject = this.mapReference(
                    { key: model, object },
                    mapping,
                    originCategoryOptionCombos,
                    destinationCategoryOptionCombos
                );

                return _.mapValues(mappedObject, (value, key) => {
                    const { propertyType, itemPropertyType } = properties[key] ?? {};

                    if (propertyType === "REFERENCE") {
                        return this.mapReference(
                            { parent: model, key, object: value },
                            mapping,
                            originCategoryOptionCombos,
                            destinationCategoryOptionCombos
                        );
                    }

                    if (itemPropertyType === "REFERENCE" && Array.isArray(value)) {
                        return value.map(item =>
                            this.mapReference(
                                { parent: model, key, object: item },
                                mapping,
                                originCategoryOptionCombos,
                                destinationCategoryOptionCombos
                            )
                        );
                    }

                    if (propertyType === "COMPLEX" || itemPropertyType === "COMPLEX") {
                        return this.mapComplex(value, mapping);
                    }

                    return value;
                });
            });
        });
    }

    private mapComplex(object: any, mapping: MetadataMappingDictionary): any {
        if (Array.isArray(object)) return object.map(item => this.mapComplex(item, mapping));

        return _.mapValues(object, (value, key) => {
            if (key === "id" && typeof value === "string") {
                return this.lookup(mapping, value);
            } else if (typeof value === "object") {
                return this.mapComplex(value, mapping);
            } else {
                return value;
            }
        });
    }

    private mapReference<T extends Ref>(
        {
            parent,
            key,
            object,
        }: {
            parent?: string;
            key: string;
            object: T;
        },
        mapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[]
    ): T {
        const modelName = cleanToModelName(this.api, key, parent);
        if (!modelName) return object;

        const mappedId = this.lookup(mapping, object.id);

        if (modelName === "indicators") {
            const indicator = (object as unknown) as Partial<Indicator>;
            const numerator = this.mapExpression(
                indicator.numerator,
                mapping,
                originCategoryOptionCombos,
                destinationCategoryOptionCombos
            );
            const denominator = this.mapExpression(
                indicator.denominator,
                mapping,
                originCategoryOptionCombos,
                destinationCategoryOptionCombos
            );
            return { ...object, id: mappedId, numerator, denominator };
        }

        return { ...object, id: mappedId };
    }

    private mapExpression(
        expression: string | undefined,
        mapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[]
    ): string | undefined {
        if (!expression) return undefined;

        const config = ExpressionParser.parse(expression).value.data ?? [];
        const mappedConfig = config.map(expression => {
            const mappedExpression = this.transformExpression(
                expression,
                mapping,
                originCategoryOptionCombos,
                destinationCategoryOptionCombos
            );
            if (mappedExpression) return mappedExpression;

            // Best effort default lookup
            return _.mapValues(expression, (id, property) => {
                const modelName = cleanToModelName(this.api, property);
                if (!modelName || typeof id !== "string") return id;
                return this.lookup(mapping, id);
            });
        });

        const validation = ExpressionParser.build(mappedConfig as Expression[]);
        if (validation.isError()) return expression;

        return validation.value.data;
    }

    private transformExpression(
        expression: Expression,
        mapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[]
    ): Expression | undefined {
        switch (expression.type) {
            case "dataElement": {
                const { mappedId: dataElement, mapping: innerMapping = {} } =
                    mapping["aggregatedDataElements"][expression.dataElement] ?? {};
                if (!dataElement) return undefined;

                const categoryOptionCombo =
                    mapCategoryOptionCombo(
                        expression.categoryOptionCombo,
                        [innerMapping, mapping],
                        originCategoryOptionCombos,
                        destinationCategoryOptionCombos
                    ) ?? expression.categoryOptionCombo;

                const attributeOptionCombo =
                    mapCategoryOptionCombo(
                        expression.attributeOptionCombo,
                        [innerMapping, mapping],
                        originCategoryOptionCombos,
                        destinationCategoryOptionCombos
                    ) ?? expression.attributeOptionCombo;

                return {
                    type: "dataElement",
                    dataElement,
                    categoryOptionCombo,
                    attributeOptionCombo,
                };
            }
            case "programDataElement": {
                const { mappedId: program = expression.program } =
                    mapping["eventPrograms"][expression.program] ?? {};

                const dataElementId = _.keys(mapping["programDataElements"]).find(id => {
                    const parts = id.split("-");
                    const sameProgram = _.first(parts) === expression.program;
                    const sameDataElement = _.last(parts) === expression.dataElement;
                    return sameProgram && sameDataElement;
                });

                if (!dataElementId)
                    return {
                        type: "programDataElement",
                        program,
                        dataElement: expression.dataElement,
                    };

                const { mappedId: dataElement = expression.dataElement } =
                    mapping["programDataElements"][dataElementId] ?? {};

                return {
                    type: "programDataElement",
                    program,
                    dataElement,
                };
            }
            default:
                return undefined;
        }
    }

    private lookup(mapping: MetadataMappingDictionary, id?: string): string | undefined {
        // We would normally use _.get(mapping, [modelName, id]) but modelName of mapping is custom
        const mappingStore: MetadataMapping[] = _.values(mapping)
            .map(item => _.mapValues(item, (value, id) => ({ id, ...value })))
            .flatMap(_.values);

        return mappingStore.find(item => item.id === id)?.mappedId ?? id;
    }
}
