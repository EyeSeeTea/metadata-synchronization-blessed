import _ from "lodash";
import memoize from "nano-memoize";
import { defaultName, modelFactory } from "../../../models/dhis/factory";
import { ExportBuilder } from "../../../types/synchronization";
import { Maybe } from "../../../types/utils";
import { promiseMap } from "../../../utils/common";
import { debug } from "../../../utils/debug";
import { Ref } from "../../common/entities/Ref";
import { DataStoreMetadata } from "../../data-store/DataStoreMetadata";
import { Instance } from "../../instance/entities/Instance";
import { MappingMapper } from "../../mapping/helpers/MappingMapper";
import { Stats } from "../../reports/entities/Stats";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import { Document, MetadataEntities, MetadataPackage, Program } from "../entities/MetadataEntities";
import { NestedRules } from "../entities/MetadataExcludeIncludeRules";
import { buildNestedRules, cleanObject, cleanReferences, getAllReferences } from "../utils";

export class MetadataSyncUseCase extends GenericSyncUseCase {
    public readonly type = "metadata";

    public async exportMetadata(originalBuilder: ExportBuilder): Promise<MetadataPackage> {
        const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
            const {
                type,
                ids,
                excludeRules,
                includeRules,
                includeSharingSettings,
                removeOrgUnitReferences,
                removeUserObjectsAndReferences,
            } = builder;

            //TODO: when metadata entities schema exists on domain, move this factory to domain
            const collectionName = modelFactory(type).getCollectionName();
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
                //ProgramRules is not included in programs items in the response by the dhis2 API
                //we request it manually and insert it in the element
                const fixedElement =
                    type === "programs" ? await this.requestAndIncludeProgramRules(element as Program) : element;

                // Store metadata object in result
                const object = cleanObject(
                    this.api,
                    schema.name,
                    fixedElement,
                    excludeRules,
                    includeSharingSettings,
                    removeOrgUnitReferences,
                    removeUserObjectsAndReferences
                );

                result[collectionName] = result[collectionName] || [];
                result[collectionName]?.push(object);

                // Get all the referenced metadata
                const references = getAllReferences(this.api, object, schema.name);
                const includedReferences = cleanReferences(references, includeRules);

                const partialResults = await promiseMap(includedReferences, type => {
                    return recursiveExport({
                        type: type as keyof MetadataEntities,
                        ids: references[type],
                        excludeRules: nestedExcludeRules[type],
                        includeRules: nestedIncludeRules[type],
                        includeSharingSettings,
                        removeOrgUnitReferences,
                        removeUserObjectsAndReferences,
                    });
                });

                _.deepMerge(result, ...partialResults);
            }

            // Clean up result from duplicated elements
            return _.mapValues(result, objects => _.uniqBy(objects, "id"));
        };
        return recursiveExport(originalBuilder);
    }

    public buildPayload = memoize(async () => {
        const { metadataIds, syncParams, filterRules = [] } = this.builder;
        const {
            includeSharingSettings = true,
            removeOrgUnitReferences = false,
            removeUserObjectsAndReferences = false,
            metadataIncludeExcludeRules = {},
            useDefaultIncludeExclude = {},
        } = syncParams ?? {};

        const metadataRepository = await this.getMetadataRepository();
        const filterRulesIds = await metadataRepository.getByFilterRules(filterRules);
        const allMetadataIds = _.union(metadataIds, filterRulesIds);
        const idsWithoutDataStore = allMetadataIds.filter(id => !DataStoreMetadata.isDataStoreId(id));
        const metadata = await metadataRepository.getMetadataByIds<Ref>(idsWithoutDataStore, "id,type"); //type is required to transform visualizations to charts and report tables

        const metadataWithSyncAll: Partial<Record<keyof MetadataEntities, Ref[]>> = await Promise.all(
            (syncParams?.metadataModelsSyncAll ?? []).map(
                async type =>
                    await metadataRepository
                        .listAllMetadata({ type: type as keyof MetadataEntities, fields: { id: true, type: true } })
                        .then(metadata => ({
                            [type]: metadata,
                        }))
            )
        ).then(syncAllMetadata => _.deepMerge(metadata, ...syncAllMetadata)); //TODO: don't mix async/.then 963#discussion_r1682376524

        const exportResults = await promiseMap(_.keys(metadataWithSyncAll), type => {
            const myClass = modelFactory(type);
            const metadataType = myClass.getMetadataType();
            const collectionName = myClass.getCollectionName();

            if (metadataType === defaultName) return Promise.resolve({});

            return this.exportMetadata({
                type: collectionName,
                ids: metadataWithSyncAll[collectionName]?.map(e => e.id) || [],
                excludeRules: useDefaultIncludeExclude
                    ? myClass.getExcludeRules()
                    : metadataIncludeExcludeRules[metadataType].excludeRules.map(_.toPath),
                includeRules: useDefaultIncludeExclude
                    ? myClass.getIncludeRules()
                    : metadataIncludeExcludeRules[metadataType].includeRules.map(_.toPath),
                includeSharingSettings,
                removeOrgUnitReferences,
                removeUserObjectsAndReferences,
            });
        });

        const metadataPackage: MetadataPackage = _.deepMerge({}, ...exportResults);
        const metadataWithoutDuplicates: MetadataPackage = _.mapValues(metadataPackage, elements =>
            _.uniqBy(elements, "id")
        );

        const { organisationUnits, users, ...rest } = metadataWithoutDuplicates;

        const finalMetadataPackage = {
            organisationUnits: !syncParams?.removeOrgUnitObjects ? organisationUnits : undefined,
            users: !syncParams?.removeUserObjects && !syncParams?.removeUserObjectsAndReferences ? users : undefined,
            ...rest,
        };

        debug("Metadata package", finalMetadataPackage);
        return finalMetadataPackage;
    });

    public async postPayload(instance: Instance): Promise<SynchronizationResult[]> {
        const { syncParams } = this.builder;

        const originalPayload = await this.buildPayload();

        const payloadWithDocumentFiles = await this.createDocumentFilesInRemote(instance, originalPayload);

        const payload = await this.mapPayload(instance, payloadWithDocumentFiles);

        debug("Metadata package", { originalPayload, payload });

        const dataStorePayload = await this.buildDataStorePayload(instance);
        const dataStoreResult =
            dataStorePayload.length > 0 ? await this.saveDataStorePayload(instance, dataStorePayload) : undefined;

        const remoteMetadataRepository = await this.getMetadataRepository(instance);
        const metadataResult = await remoteMetadataRepository.save(payload, syncParams);
        const origin = await this.getOriginInstance();

        const syncResult = this.generateSyncResults(metadataResult, dataStoreResult);
        return [{ ...syncResult, origin: origin.toPublicObject(), payload }];
    }

    private generateSyncResults(
        metadataResult: SynchronizationResult,
        dataStoreResult: Maybe<SynchronizationResult>
    ): SynchronizationResult {
        if (!dataStoreResult) return metadataResult;

        return {
            ...metadataResult,
            typeStats: _(metadataResult.typeStats)
                .concat(dataStoreResult.typeStats || [])
                .value(),
            stats: metadataResult.stats ? Stats.sumStats(metadataResult.stats, dataStoreResult.stats) : undefined,
        };
    }

    private async buildDataStorePayload(instance: Instance): Promise<DataStoreMetadata[]> {
        const { metadataIds, syncParams } = this.builder;
        const dataStore = DataStoreMetadata.buildFromKeys(metadataIds);
        if (dataStore.length === 0) return [];

        const dataStoreRepository = await this.getDataStoreMetadataRepository();
        const dataStoreRemoteRepository = await this.getDataStoreMetadataRepository(instance);

        const dataStoreLocal = await dataStoreRepository.get(dataStore);
        const dataStoreRemote = await dataStoreRemoteRepository.get(dataStore);

        const dataStorePayload = DataStoreMetadata.combine(metadataIds, dataStoreLocal, dataStoreRemote, {
            action: syncParams?.mergeMode,
        });
        return syncParams?.includeSharingSettings
            ? dataStorePayload
            : DataStoreMetadata.removeSharingSettings(dataStorePayload);
    }

    private async saveDataStorePayload(
        instance: Instance,
        dataStores: DataStoreMetadata[]
    ): Promise<SynchronizationResult> {
        const dataStoreRemoteRepository = await this.getDataStoreMetadataRepository(instance);
        const result = await dataStoreRemoteRepository.save(dataStores);
        return result;
    }

    public async buildDataStats() {
        return undefined;
    }

    public async mapPayload(instance: Instance, payload: MetadataPackage): Promise<MetadataPackage> {
        const { syncParams } = this.builder;

        if (syncParams?.enableMapping) {
            const metadataRepository = await this.getMetadataRepository();
            const remoteMetadataRepository = await this.getMetadataRepository(instance);

            const originCategoryOptionCombos = await metadataRepository.getCategoryOptionCombos();
            const destinationCategoryOptionCombos = await remoteMetadataRepository.getCategoryOptionCombos();
            const mapping = await this.getMapping(instance);

            const mapper = new MappingMapper(mapping, originCategoryOptionCombos, destinationCategoryOptionCombos);

            return mapper.applyMapping(payload);
        } else {
            return payload;
        }
    }

    public async createDocumentFilesInRemote(instance: Instance, payload: MetadataPackage): Promise<MetadataPackage> {
        if (!payload.documents) return payload;

        const fileRepository = await this.getInstanceFileRepository();
        const fileRemoteRepository = await this.getInstanceFileRepository(instance);

        const documents = await promiseMap(payload.documents as Document[], async (document: Document) => {
            if (document.external) return document;

            const file = await fileRepository.getById(document.id);
            const fileId = await fileRemoteRepository.save(file);
            return { ...document, url: fileId };
        });

        return { ...payload, documents };
    }

    private async requestAndIncludeProgramRules(program: Program) {
        const metadataRepository = await this.getMetadataRepository();
        const programRules = await metadataRepository.listAllMetadata({
            type: "programRules",
            fields: { id: true },
            program: program.id,
        });
        return { ...program, programRules };
    }
}
