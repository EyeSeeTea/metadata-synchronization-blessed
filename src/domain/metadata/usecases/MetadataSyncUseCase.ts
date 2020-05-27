import _ from "lodash";
import memoize from "nano-memoize";

import InstanceEntity from "../../instance/Instance";
import { GenericSync, SyncronizationPayload } from "../../../logic/sync/generic";
import MetadataD2ApiRepository from "../../../data/metadata/repositories/MetadataD2ApiRepository";
import { MetadataRepository } from "../MetadataRepositoriy";
import { MetadataPackage, MetadataEntities } from "../entities";
import { Ref } from "../../common/entities";
import {
    buildNestedRules,
    cleanObject,
    getAllReferences,
    cleanReferences,
    cleanMetadataImportResponse
} from "../utils";

//TODO: Uncouple this dependencies. This class should be moved to domain
// and It should have not any dependency outside from the domain
import { D2Api } from "../../../types/d2-api";
import { D2 } from "../../../types/d2";
import Instance from "../../../models/instance";
import { d2ModelFactory } from "../../../models/dhis/factory";
import { ExportBuilder, NestedRules, SynchronizationBuilder } from "../../../types/synchronization";
import { promiseMap } from "../../../utils/common";


export class MetadataSyncUseCase extends GenericSync {
    public readonly type = "metadata";
    private metadataRepository: MetadataRepository

    constructor(d2: D2, api: D2Api, builder: SynchronizationBuilder) {
        super(d2, api, builder)

        //TODO: composition root - This dependency should be injected by constructor when we have
        // composition root
        this.metadataRepository = new MetadataD2ApiRepository(api);
    }

    public async exportMetadata(originalBuilder: ExportBuilder): Promise<MetadataPackage> {
        const visitedIds: Set<string> = new Set();
        const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
            const { type, ids, excludeRules, includeRules, includeSharingSettings } = builder;

            //TODO: when metadata entities schema exists on domain, move this factory to domain
            const model = d2ModelFactory(this.api, type).getD2Model(this.d2);
            const collectionName = model.plural as keyof MetadataEntities;
            const result: MetadataPackage = {};

            // Each level of recursion traverse the exclude/include rules with nested values
            const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
            const nestedIncludeRules: NestedRules = buildNestedRules(includeRules);

            // Get all the required metadata
            const syncMetadata = await this.metadataRepository.getMetadataByIds(ids);
            const elements = syncMetadata[collectionName] || [];

            for (const element of elements) {
                // Store metadata object in result
                const object = cleanObject(
                    this.d2,
                    model.name,
                    element,
                    excludeRules,
                    includeSharingSettings
                );

                result[collectionName] = result[collectionName] || [];
                result[collectionName]?.push(object);

                // Get all the referenced metadata
                const references = getAllReferences(this.d2, object, model.name);
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

        const metadata = await this.metadataRepository.getMetadataFieldsByIds<Ref>(metadataIds, "id");

        const exportResults = await promiseMap(_.keys(metadata), type => {
            const myClass = d2ModelFactory(this.api, type);
            const metadataType = myClass.getMetadataType();

            const metadatatype = type as keyof MetadataEntities;

            return this.exportMetadata({
                type: metadatatype,
                ids: metadata[metadatatype]?.map((e) => e.id) || [],
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
        const metadataWithoutDuplicates: MetadataPackage = _.mapValues(metadataPackage, elements => _.uniqBy(elements, "id"));

        return metadataWithoutDuplicates;
    });

    public async postPayload(instance: Instance, instanceEntity: InstanceEntity) {
        //TODO: remove instance from abstract method in base base class 
        // when aggregated and events does not use 
        console.log(instance.url);

        const { syncParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();

        console.debug("Metadata package", payloadPackage);

        const response = await this.metadataRepository.save(payloadPackage, syncParams, instanceEntity);
        const syncResult = cleanMetadataImportResponse(response, instanceEntity, this.type);
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
