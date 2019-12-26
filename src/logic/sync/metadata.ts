import _ from "lodash";
import memoize from "nano-memoize";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import Instance from "../../models/instance";
import { ExportBuilder, MetadataPackage, NestedRules } from "../../types/synchronization";
import {
    buildNestedRules,
    cleanObject,
    cleanReferences,
    getAllReferences,
    getMetadata,
    postMetadata,
    cleanMetadataImportResponse,
} from "../../utils/synchronization";
import { GenericSync } from "./generic";
import { MetadataImportResponse } from "../../types/d2";

export class MetadataSync extends GenericSync {
    protected readonly type = "metadata";

    private async exportMetadata(originalBuilder: ExportBuilder): Promise<MetadataPackage> {
        const visitedIds: Set<string> = new Set();
        const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
            const { type, ids, excludeRules, includeRules, includeSharingSettings } = builder;
            const model = d2ModelFactory(this.d2, type).getD2Model(this.d2);
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
                        type,
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

    protected buildPayload = memoize(async () => {
        const { metadataIds, syncParams = {} } = this.builder;
        const { baseUrl } = this.d2.Api.getApi();

        const metadata = await getMetadata(baseUrl, metadataIds, "id");
        const exportPromises = _.keys(metadata)
            .map(type => {
                const myClass = d2ModelFactory(this.d2, type);
                return {
                    type,
                    ids: metadata[type].map(e => e.id),
                    excludeRules: myClass.getExcludeRules(),
                    includeRules: myClass.getIncludeRules(),
                    includeSharingSettings: !!syncParams.includeSharingSettings,
                };
            })
            .map(newBuilder => this.exportMetadata(newBuilder));
        const exportResults: MetadataPackage[] = await Promise.all(exportPromises);

        return _.deepMerge({}, ...exportResults);
    });

    protected async postPayload(instance: Instance) {
        const { syncParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();

        return postMetadata(instance, payloadPackage, syncParams);
    }

    protected cleanResponse(response: MetadataImportResponse, instance: Instance) {
        return cleanMetadataImportResponse(response, instance);
    }
}
