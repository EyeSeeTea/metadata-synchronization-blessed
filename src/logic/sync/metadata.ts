import { D2ModelSchemas } from "d2-api";
import _ from "lodash";
import memoize from "nano-memoize";
import { d2ModelFactory } from "../../models/dhis/factory";
import Instance from "../../models/instance";
import { ExportBuilder, MetadataPackage, NestedRules } from "../../types/synchronization";
import { promiseMap } from "../../utils/common";
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
    public readonly type = "metadata";

    public async exportMetadata(originalBuilder: ExportBuilder): Promise<MetadataPackage> {
        const visitedIds: Set<string> = new Set();
        const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
            const { type, ids, excludeRules, includeRules, includeSharingSettings } = builder;
            const model = d2ModelFactory(this.api, type).getD2Model(this.d2);
            const result: MetadataPackage = {};

            // Each level of recursion traverse the exclude/include rules with nested values
            const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
            const nestedIncludeRules: NestedRules = buildNestedRules(includeRules);

            // Get all the required metadata
            const syncMetadata = await getMetadata(this.api, ids);
            const elements = syncMetadata[model.plural] || [];

            for (const element of elements) {
                // Store metadata object in result
                const object = cleanObject(
                    this.d2,
                    model.name,
                    element,
                    excludeRules,
                    includeSharingSettings
                );
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
        const { metadataIds, syncParams } = this.builder;
        const {
            includeSharingSettings = true,
            metadataIncludeExcludeRules = {},
            useDefaultIncludeExclude = {},
        } = syncParams ?? {};

        const metadata = await getMetadata(this.api, metadataIds, "id");
        const exportResults = await promiseMap(_.keys(metadata), type => {
            const myClass = d2ModelFactory(this.api, type);
            const metadataType = myClass.getMetadataType();

            return this.exportMetadata({
                type: type as keyof D2ModelSchemas,
                ids: metadata[type].map(e => e.id),
                excludeRules: useDefaultIncludeExclude
                    ? myClass.getExcludeRules()
                    : metadataIncludeExcludeRules[metadataType].excludeRules.map(_.toPath),
                includeRules: useDefaultIncludeExclude
                    ? myClass.getIncludeRules()
                    : metadataIncludeExcludeRules[metadataType].includeRules.map(_.toPath),
                includeSharingSettings,
            });
        });

        return _.mapValues(_.deepMerge({}, ...exportResults), elements => _.uniqBy(elements, "id"));
    });

    public async postPayload(instance: Instance) {
        const { syncParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();
        console.debug("Metadata package", payloadPackage);

        const response = await postMetadata(instance.getApi(), payloadPackage, syncParams);
        const syncResult = cleanMetadataImportResponse(response, instance, this.type);
        return [syncResult];
    }

    public async buildDataStats() {
        return undefined;
    }

    public async mapPayload(
        _instance: Instance,
        payload: SyncronizationPayload
    ): Promise<SyncronizationPayload> {
        return payload;
    }
}
