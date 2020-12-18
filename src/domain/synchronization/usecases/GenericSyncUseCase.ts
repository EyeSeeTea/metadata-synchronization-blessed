import { D2Api } from "d2-api/2.30";
import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import i18n from "../../../locales";
import { SynchronizationBuilder } from "../entities/SynchronizationBuilder";
import { cache } from "../../../utils/cache";
import { promiseMap } from "../../../utils/common";
import { getD2APiFromInstance } from "../../../utils/d2-utils";
import { debug } from "../../../utils/debug";
import { AggregatedPackage } from "../../aggregated/entities/AggregatedPackage";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { Repositories, RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { EventsPackage } from "../../events/entities/EventsPackage";
import { EventsSyncUseCase } from "../../events/usecases/EventsSyncUseCase";
import { FileRepositoryConstructor } from "../../file/FileRepository";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import { MetadataMapping, MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { DeletedMetadataSyncUseCase } from "../../metadata/usecases/DeletedMetadataSyncUseCase";
import { MetadataSyncUseCase } from "../../metadata/usecases/MetadataSyncUseCase";
import {
    AggregatedDataStats,
    EventsDataStats,
    SynchronizationReport,
    SynchronizationReportStatus,
} from "../../reports/entities/SynchronizationReport";
import {
    SynchronizationResult,
    SynchronizationStatus,
} from "../../reports/entities/SynchronizationResult";
import { SynchronizationType } from "../entities/SynchronizationType";
import { executeAnalytics } from "../../../utils/analytics";

export type SyncronizationClass =
    | typeof MetadataSyncUseCase
    | typeof AggregatedSyncUseCase
    | typeof EventsSyncUseCase
    | typeof DeletedMetadataSyncUseCase;
export type SyncronizationPayload = MetadataPackage | AggregatedPackage | EventsPackage;

export interface PostPayloadResult {
    results: SynchronizationResult[];
    payload?: MetadataPackage;
}

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

    public abstract buildPayload(): Promise<SyncronizationPayload>;
    public abstract mapPayload(
        instance: Instance,
        payload: SyncronizationPayload
    ): Promise<SyncronizationPayload>;

    // We start to use domain concepts:
    // for the moment old model instance and domain entity instance are going to live together for a while on sync classes.
    // Little by little through refactors the old instance model should disappear
    public abstract postPayload(instance: Instance): Promise<PostPayloadResult>;
    public abstract buildDataStats(): Promise<
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
        return this.repositoryFactory.instanceRepository(remoteInstance ?? defaultInstance);
    }

    @cache()
    protected getTransformationRepository() {
        return this.repositoryFactory.transformationRepository();
    }

    @cache()
    protected async getMetadataRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.metadataRepository(remoteInstance ?? defaultInstance);
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
        return this.repositoryFactory.aggregatedRepository(remoteInstance ?? defaultInstance);
    }

    @cache()
    protected async getEventsRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.eventsRepository(remoteInstance ?? defaultInstance);
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

        return SynchronizationReport.build({
            user: currentUser.userCredentials.username ?? "Unknown",
            types: _.keys(metadataPackage),
            status: "RUNNING" as SynchronizationReportStatus,
            syncRule,
            type: this.type,
            dataStats,
        });
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClient();

        const data = await storageClient.getObjectInCollection<InstanceData>(
            Namespace.INSTANCES,
            id
        );

        if (!data) return undefined;

        const instance = Instance.build({
            ...data,
            url: data.type === "local" ? this.localInstance.url : data.url,
            version: data.type === "local" ? this.localInstance.version : data.version,
        }).decryptPassword(this.encryptionKey);

        try {
            const version = await this.repositoryFactory.instanceRepository(instance).getVersion();
            return instance.update({ version });
        } catch (error) {
            return instance;
        }
    }

    public async *execute() {
        const { targetInstances: targetInstanceIds, syncRule, dataParams } = this.builder;

        const origin = await this.getOriginInstance();

        if (dataParams && dataParams.runAnalytics) {
            for await (const message of executeAnalytics(origin)) {
                yield { message };
            }

            yield { message: i18n.t("Analytics execution finished on {{name}}", origin) };
        }

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

                // TODO: @Jocelyn here you will receive the payload
                const { results, payload } = await this.postPayload(instance);
                syncReport.addSyncResult(...results);
                if (payload) {
                    syncReport.setPayload(payload);
                }

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
            const oldRule = await this.repositoryFactory
                .rulesRepository(this.localInstance)
                .getById(syncRule);

            if (oldRule) {
                const updatedRule = oldRule.updateLastExecuted(new Date());
                await this.repositoryFactory.rulesRepository(this.localInstance).save(updatedRule);
            }
        }

        // Phase 5: Update parent task status
        syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
        yield { syncReport, done: true };

        return syncReport;
    }
}
