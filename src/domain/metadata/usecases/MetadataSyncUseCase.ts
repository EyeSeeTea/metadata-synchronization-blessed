import _ from "lodash";
import memoize from "nano-memoize";
import { modelFactory } from "../../../models/dhis/factory";
import { ExportBuilder, NestedRules } from "../../../types/synchronization";
import { promiseMap } from "../../../utils/common";
import { Expression, ExpressionParser } from "../../../utils/expressionParser";
import { Ref } from "../../common/entities/Ref";
import { Instance } from "../../instance/entities/Instance";
import { MetadataMappingDictionary } from "../../instance/entities/MetadataMapping";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import { Indicator, MetadataEntities, MetadataPackage } from "../entities/MetadataEntities";
import {
    buildNestedRules,
    cleanObject,
    cleanReferences,
    cleanToModelName,
    getAllReferences
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
        const { syncParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();
        const mappedPayloadPackage = await this.mapPayload(instance, payloadPackage);

        console.debug("Metadata package", { payloadPackage, mappedPayloadPackage });

        const remoteMetadataRepository = await this.getMetadataRepository(instance);
        const syncResult = await remoteMetadataRepository.save(mappedPayloadPackage, syncParams);
        const origin = await this.getOriginInstance();

        return [{ ...syncResult, origin: origin.toPublicObject() }];
    }

    public async buildDataStats() {
        return undefined;
    }

    public async mapPayload(
        { metadataMapping: mapping }: Instance,
        payload: MetadataPackage
    ): Promise<MetadataPackage> {
        return _.mapValues(payload, (items, model) => {
            const collectionName = modelFactory(this.api, model).getCollectionName();
            const references = this.api.models[collectionName]?.schema.properties
                .filter(
                    ({ propertyType, itemPropertyType }) =>
                        propertyType === "REFERENCE" || itemPropertyType === "REFERENCE"
                )
                .map(({ name }) => name);

            return items?.map((object: any) => {
                if (typeof object !== "object") return object;

                const mappedObject = this.mapProperty({ key: model, object, mapping });

                return _.mapValues(mappedObject, (value, key) => {
                    if (!references.includes(key)) return value;

                    if (Array.isArray(value)) {
                        return value.map(item =>
                            this.mapProperty({ parent: model, key, object: item, mapping })
                        );
                    }

                    return this.mapProperty({ parent: model, key, object: value, mapping });
                });
            });
        });
    }

    private mapProperty<T extends Ref>({
        parent,
        key,
        object,
        mapping,
    }: {
        parent?: string;
        key: string;
        object: T;
        mapping: MetadataMappingDictionary;
    }): T {
        const modelName = cleanToModelName(this.api, key, parent);
        if (!modelName) return object;

        const mappedId = _.get(mapping, [modelName, object.id])?.mappedId ?? object.id;

        if (modelName === "indicators") {
            const indicator = (object as unknown) as Indicator;
            const numerator = this.mapExpression(indicator.numerator, mapping);
            const denominator = this.mapExpression(indicator.denominator, mapping);
            return { ...object, id: mappedId, numerator, denominator };
        }

        return { ...object, id: mappedId };
    }

    private mapExpression(expression: string, mapping: MetadataMappingDictionary) {
        const config = ExpressionParser.parse(expression).value.data ?? [];
        const mappedConfig = config.map(expression => {
            return _.mapValues(expression, (id, property) => {
                const modelName = cleanToModelName(this.api, property);
                if (!modelName || typeof id !== "string") return id;
                return _.get(mapping, [modelName, id])?.mappedId ?? id;
            });
        });

        const validation = ExpressionParser.build(mappedConfig as Expression[]);
        if (validation.isError()) return expression;

        return validation.value.data;
    }
}
