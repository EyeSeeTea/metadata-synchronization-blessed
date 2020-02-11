import { D2ModelSchemas } from "d2-api";
import _ from "lodash";
import memoize from "nano-memoize";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import Instance from "../../models/instance";
import { MetadataImportResponse } from "../../types/d2";
import { ExportBuilder, MetadataPackage, NestedRules } from "../../types/synchronization";
import {
    buildNestedRules,
    cleanMetadataImportResponse,
    cleanObject,
    cleanReferences,
    getAllReferences,
    getMetadata,
    postMetadata,
} from "../../utils/synchronization";
import { GenericSync, SyncronizationPayload } from "./generic";

export class MetadataSync extends GenericSync {
    protected readonly type = "metadata";

    private async exportMetadata(originalBuilder: ExportBuilder): Promise<MetadataPackage> {
        const visitedIds: Set<string> = new Set();
        const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
            const { type, ids, excludeRules, includeRules, includeSharingSettings } = builder;
            const model = d2ModelFactory(this.api, type).getD2Model(this.d2);
            const result: MetadataPackage = {};

            // Each level of recursion traverse the exclude/include rules with nested values
            const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
            const nestedIncludeRules: NestedRules = buildNestedRules(includeRules);

            // Get all the required metadata
            const { baseUrl } = this.d2.Api.getApi();
            const syncMetadata = await getMetadata(baseUrl, ids);
            const elements = syncMetadata[model.plural] || [];

            for (const element of elements) {
                // Store metadata object in result
                const object = cleanObject(element, excludeRules, includeSharingSettings);
                result[model.plural] = result[model.plural] || [];
                result[model.plural].push(object);

                // Get all the referenced metadata
                const references: MetadataPackage = getAllReferences(this.d2, object, model.name);
                const includedReferences = cleanReferences(references, includeRules);
                const promises = includedReferences
                    .map(type => ({
                        type: type as keyof D2ModelSchemas,
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
        const { baseUrl } = this.d2.Api.getApi();
        const { metadataIds, syncParams } = this.builder;
        const {
            includeSharingSettings = true,
            metadataIncludeExcludeRules = {},
            useDefaultIncludeExclude = {},
        } = syncParams ?? {};

        const metadata = await getMetadata(baseUrl, metadataIds, "id");
        const exportPromises = _.keys(metadata)
            .map(type => {
                const myClass = d2ModelFactory(this.api, type as keyof D2ModelSchemas);
                const metadataType = myClass.getMetadataType();

                return {
                    type: type as keyof D2ModelSchemas,
                    ids: metadata[type].map(e => e.id),
                    excludeRules: useDefaultIncludeExclude
                        ? myClass.getExcludeRules()
                        : metadataIncludeExcludeRules[metadataType].excludeRules.map(_.toPath),
                    includeRules: useDefaultIncludeExclude
                        ? myClass.getIncludeRules()
                        : metadataIncludeExcludeRules[metadataType].includeRules.map(_.toPath),
                    includeSharingSettings,
                };
            })
            .map(newBuilder => this.exportMetadata(newBuilder));
        const exportResults: MetadataPackage[] = await Promise.all(exportPromises);

        return _.deepMerge({}, ...exportResults);
    });

    protected async postPayload(instance: Instance) {
        const { syncParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();
        console.debug("Metadata package", payloadPackage);

        return postMetadata(instance, payloadPackage, syncParams);
    }

    protected cleanResponse(response: MetadataImportResponse, instance: Instance) {
        return cleanMetadataImportResponse(response, instance);
    }

    protected async buildDataStats() {
        return undefined;
    }

    protected async mapMetadata(
        _instance: Instance,
        payload: SyncronizationPayload
    ): Promise<SyncronizationPayload> {
        return payload;
    }
}
