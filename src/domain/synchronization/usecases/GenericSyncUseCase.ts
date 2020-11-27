import { D2Api } from "d2-api/2.30";
import _ from "lodash";
import i18n from "../../../locales";
import SyncReport from "../../../models/syncReport";
import SyncRule from "../../../models/syncRule";
import { SynchronizationBuilder } from "../../../types/synchronization";
import { cache } from "../../../utils/cache";
import { promiseMap } from "../../../utils/common";
import { getD2APiFromInstance } from "../../../utils/d2-utils";
import { debug } from "../../../utils/debug";
import { AggregatedPackage } from "../../aggregated/entities/AggregatedPackage";
import { AggregatedRepositoryConstructor } from "../../aggregated/repositories/AggregatedRepository";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { EventsPackage } from "../../events/entities/EventsPackage";
import { EventsRepositoryConstructor } from "../../events/repositories/EventsRepository";
import { EventsSyncUseCase } from "../../events/usecases/EventsSyncUseCase";
import { FileRepositoryConstructor } from "../../file/FileRepository";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataMapping, MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { MetadataRepositoryConstructor } from "../../metadata/repositories/MetadataRepository";
import { DeletedMetadataSyncUseCase } from "../../metadata/usecases/DeletedMetadataSyncUseCase";
import { MetadataSyncUseCase } from "../../metadata/usecases/MetadataSyncUseCase";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { TransformationRepositoryConstructor } from "../../transformations/repositories/TransformationRepository";
import {
    AggregatedDataStats,
    EventsDataStats,
    SynchronizationReportStatus,
} from "../entities/SynchronizationReport";
import { SynchronizationResult, SynchronizationStatus } from "../entities/SynchronizationResult";
import { SynchronizationType } from "../entities/SynchronizationType";

export type SyncronizationClass =
    | typeof MetadataSyncUseCase
    | typeof AggregatedSyncUseCase
    | typeof EventsSyncUseCase
    | typeof DeletedMetadataSyncUseCase;
export type SyncronizationPayload = MetadataPackage | AggregatedPackage | EventsPackage;

export abstract class GenericSyncUseCase {
    public abstract readonly type: SynchronizationType;
    public readonly fields: string = "id,name";
    protected readonly api: D2Api;

    constructor(
        protected readonly builder: SynchronizationBuilder,
        protected readonly repositoryFactory: RepositoryFactory,
        protected readonly localInstance: Instance,
        protected readonly encryptionKey: string
    ) {
        this.api = getD2APiFromInstance(localInstance);
    }

    public abstract async buildPayload(): Promise<SyncronizationPayload>;
    public abstract async mapPayload(
        instance: Instance,
        payload: SyncronizationPayload
    ): Promise<SyncronizationPayload>;

    // We start to use domain concepts:
    // for the moment old model instance and domain entity instance are going to live together for a while on sync classes.
    // Little by little through refactors the old instance model should disappear
    public abstract async postPayload(instance: Instance): Promise<SynchronizationResult[]>;
    public abstract async buildDataStats(): Promise<
        AggregatedDataStats[] | EventsDataStats[] | undefined
    >;

    @cache()
    public async extractMetadata<T>(remoteInstance = this.localInstance) {
        const cleanIds = this.builder.metadataIds.map(id => _.last(id.split("-")) ?? id);
        const metadataRepository = await this.getMetadataRepository(remoteInstance);
        return metadataRepository.getMetadataByIds<T>(cleanIds, this.fields);
    }

    @cache()
    protected async getInstanceRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [remoteInstance ?? defaultInstance, ""]
        );
    }

    @cache()
    protected getTransformationRepository() {
        return this.repositoryFactory.get<TransformationRepositoryConstructor>(
            Repositories.TransformationRepository,
            []
        );
    }

    @cache()
    protected async getMetadataRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [remoteInstance ?? defaultInstance, this.getTransformationRepository()]
        );
    }

    @cache()
    protected async getFileRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.get<FileRepositoryConstructor>(Repositories.FileRepository, [
            remoteInstance ?? defaultInstance,
        ]);
    }

    @cache()
    protected async getAggregatedRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.get<AggregatedRepositoryConstructor>(
            Repositories.AggregatedRepository,
            [remoteInstance ?? defaultInstance]
        );
    }

    @cache()
    protected async getEventsRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.get<EventsRepositoryConstructor>(
            Repositories.EventsRepository,
            [remoteInstance ?? defaultInstance]
        );
    }

    @cache()
    protected async getOriginInstance(): Promise<Instance> {
        const { originInstance: originInstanceId } = this.builder;
        const instance = await this.getInstanceById(originInstanceId);
        if (!instance) throw new Error("Unable to read origin instance");
        return instance;
    }

    @cache()
    protected async getMapping(instance: Instance): Promise<MetadataMappingDictionary> {
        const { originInstance: originInstanceId } = this.builder;

        // If sync is LOCAL -> REMOTE, use the destination instance mapping
        if (originInstanceId === "LOCAL") return instance.metadataMapping;

        // Otherwise use the origin (REMOTE) destination instance mapping
        const remoteInstance = await this.getOriginInstance();

        // TODO: This should be revisited in the future, does not fully work with nested ids (programs)
        const transformMapping = (
            mapping: MetadataMappingDictionary
        ): MetadataMappingDictionary => {
            return _.mapValues(mapping, value => {
                return _.transform(
                    value,
                    (acc, { mappedId, mapping, ...value }, id) => {
                        if (!!mappedId && mappedId !== "DISABLED")
                            acc[mappedId] = {
                                mappedId: id,
                                mapping: mapping ? transformMapping(mapping) : undefined,
                                ...value,
                            };
                    },
                    {} as { [id: string]: MetadataMapping }
                );
            });
        };

        return transformMapping(remoteInstance.metadataMapping);
    }

    private async buildSyncReport() {
        const { syncRule } = this.builder;
        const metadataPackage = await this.extractMetadata();
        const dataStats = await this.buildDataStats();
        const currentUser = await this.api.currentUser
            .get({ fields: { userCredentials: { username: true } } })
            .getData();

        return SyncReport.build({
            user: currentUser.userCredentials.username ?? "Unknown",
            types: _.keys(metadataPackage),
            status: "RUNNING" as SynchronizationReportStatus,
            syncRule,
            type: this.type,
            dataStats,
        });
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        if (id === "LOCAL") return this.localInstance;

        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const data = await storageRepository.getObjectInCollection<InstanceData>(
            Namespace.INSTANCES,
            id
        );

        if (!data) return undefined;

        const instance = Instance.build(data).decryptPassword(this.encryptionKey);
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );

        try {
            const version = await instanceRepository.getVersion();
            return instance.update({ version });
        } catch (error) {
            return instance;
        }
    }

    public async *execute() {
        const { targetInstances: targetInstanceIds, syncRule } = this.builder;
        const origin = await this.getOriginInstance();
        yield { message: i18n.t("Preparing synchronization") };

        // Build instance list
        const targetInstances = _.compact(
            await promiseMap(targetInstanceIds, id => this.getInstanceById(id))
        );

        // Initialize sync report
        const syncReport = await this.buildSyncReport();
        syncReport.addSyncResult(
            ...targetInstances.map(instance => ({
                instance: instance.toPublicObject(),
                origin: origin.toPublicObject(),
                status: "PENDING" as SynchronizationStatus,
                date: new Date(),
                type: this.type,
            }))
        );

        yield { syncReport };
        for (const instance of targetInstances) {
            yield {
                message: i18n.t("Start import in instance {{instance}}", {
                    instance: instance.name,
                    interpolation: { escapeValue: false },
                }),
            };

            try {
                debug("Start import on destination instance", instance.toPublicObject());

                const syncResults = await this.postPayload(instance);
                syncReport.addSyncResult(...syncResults);

                debug("Finished import on instance", instance.toPublicObject());
            } catch (error) {
                syncReport.addSyncResult({
                    status: "ERROR",
                    message: error.message,
                    instance: instance.toPublicObject(),
                    origin: origin.toPublicObject(),
                    date: new Date(),
                    type: this.type,
                });
            }

            yield { syncReport };
        }

        // Phase 4: Update sync rule last executed date
        if (syncRule) {
            const oldRule = await SyncRule.get(this.api, syncRule);
            const updatedRule = oldRule.updateLastExecuted(new Date());
            await updatedRule.save(this.api);
        }

        // Phase 5: Update parent task status
        syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
        yield { syncReport, done: true };

        return syncReport;
    }
}
