import _ from "lodash";
import memoize from "nano-memoize";
import { Maybe } from "../../../types/utils";
import { promiseMap } from "../../../utils/common";
import { debug } from "../../../utils/debug";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { DataStoreMetadata } from "../../data-store/DataStoreMetadata";
import { Instance } from "../../instance/entities/Instance";
import { MappingMapper } from "../../mapping/helpers/MappingMapper";
import { Stats } from "../../reports/entities/Stats";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { SynchronizationBuilder } from "../../synchronization/entities/SynchronizationBuilder";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import { MetadataPayloadBuilder } from "../builders/MetadataPayloadBuilder";
import { Document, MetadataPackage } from "../entities/MetadataEntities";

export class MetadataSyncUseCase extends GenericSyncUseCase {
    public readonly type = "metadata";

    constructor(
        readonly builder: SynchronizationBuilder,
        readonly repositoryFactory: DynamicRepositoryFactory,
        readonly localInstance: Instance,
        private metadataPayloadBuilder: MetadataPayloadBuilder
    ) {
        super(builder, repositoryFactory, localInstance);
    }

    protected buildPayload = memoize(async () => {
        return this.metadataPayloadBuilder.build(this.builder);
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
        return syncParams?.includeSharingSettingsObjectsAndReferences ||
            syncParams?.includeOnlySharingSettingsReferences
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
}
