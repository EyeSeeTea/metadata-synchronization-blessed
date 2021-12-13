import _ from "lodash";
import i18n from "../../../locales";
import { D2Api } from "../../../types/d2-api";
import { executeAnalytics } from "../../../utils/analytics";
import { cache } from "../../../utils/cache";
import { promiseMap } from "../../../utils/common";
import { getD2APiFromInstance } from "../../../utils/d2-utils";
import { debug } from "../../../utils/debug";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { EventsSyncUseCase } from "../../events/usecases/EventsSyncUseCase";
import { Instance } from "../../instance/entities/Instance";
import { MetadataMapping, MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { DeletedMetadataSyncUseCase } from "../../metadata/usecases/DeletedMetadataSyncUseCase";
import { MetadataSyncUseCase } from "../../metadata/usecases/MetadataSyncUseCase";
import {
    AggregatedDataStats,
    EventsDataStats,
    SynchronizationReport,
    SynchronizationReportStatus,
} from "../../reports/entities/SynchronizationReport";
import { SynchronizationResult, SynchronizationStatus } from "../../reports/entities/SynchronizationResult";
import { SynchronizationBuilder } from "../entities/SynchronizationBuilder";
import { SynchronizationPayload } from "../entities/SynchronizationPayload";
import { SynchronizationType } from "../entities/SynchronizationType";

export type SynchronizationClass =
    | typeof MetadataSyncUseCase
    | typeof AggregatedSyncUseCase
    | typeof EventsSyncUseCase
    | typeof DeletedMetadataSyncUseCase;

export abstract class GenericSyncUseCase {
    public abstract readonly type: SynchronizationType;
    public readonly fields: string = "id,name,type"; //type is required to transform visualizations to charts and report tables
    protected readonly api: D2Api;

    constructor(
        protected readonly builder: SynchronizationBuilder,
        protected readonly repositoryFactory: RepositoryFactory,
        protected readonly localInstance: Instance
    ) {
        this.api = getD2APiFromInstance(localInstance);
    }

    public abstract buildPayload(): Promise<SynchronizationPayload>;
    public abstract mapPayload(instance: Instance, payload: SynchronizationPayload): Promise<SynchronizationPayload>;

    // We start to use domain concepts:
    // for the moment old model instance and domain entity instance are going to live together for a while on sync classes.
    // Little by little through refactors the old instance model should disappear
    public abstract postPayload(instance: Instance): Promise<SynchronizationResult[]>;
    public abstract buildDataStats(): Promise<AggregatedDataStats[] | EventsDataStats[] | undefined>;

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
    protected async getInstanceFileRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.instanceFileRepository(remoteInstance ?? defaultInstance);
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
    protected async getTeisRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.teisRepository(remoteInstance ?? defaultInstance);
    }

    @cache()
    protected async getMappingRepository(remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance();
        return this.repositoryFactory.mappingRepository(remoteInstance ?? defaultInstance);
    }

    @cache()
    public async getOriginInstance(): Promise<Instance> {
        const { originInstance: originInstanceId } = this.builder;
        const instance = await this.getInstanceById(originInstanceId);
        if (!instance) throw new Error("Unable to read origin instance");
        return instance;
    }

    @cache()
    public async getMapping(instance: Instance): Promise<MetadataMappingDictionary> {
        const { originInstance: originInstanceId } = this.builder;

        const mappingRepository = await this.getMappingRepository();

        // If sync is LOCAL -> REMOTE, use the destination instance mapping
        if (originInstanceId === "LOCAL") {
            const dataSourceMapping = await mappingRepository.getByOwner({ type: "instance", id: instance.id });
            return dataSourceMapping?.mappingDictionary ?? {};
        }

        // Otherwise use the origin (REMOTE) destination instance mapping
        const remoteInstance = await this.getOriginInstance();
        const remoteDsMapping = await mappingRepository.getByOwner({ type: "instance", id: remoteInstance.id });

        // TODO: This should be revisited in the future, does not fully work with nested ids (programs)
        const transformMapping = (mapping: MetadataMappingDictionary): MetadataMappingDictionary => {
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

        return transformMapping(remoteDsMapping?.mappingDictionary ?? {});
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
        const instance = await this.repositoryFactory.instanceRepository(this.localInstance).getById(id);
        if (!instance) return undefined;

        try {
            const version = await this.repositoryFactory.instanceRepository(instance).getVersion();
            return instance.update({ version });
        } catch (error: any) {
            return instance;
        }
    }

    public async *execute() {
        const { targetInstances: targetInstanceIds, syncRule, dataParams } = this.builder;

        const origin = await this.getOriginInstance();

        if (dataParams?.enableAggregation && dataParams?.runAnalytics) {
            for await (const message of executeAnalytics(origin)) {
                yield { message };
            }

            yield { message: i18n.t("Analytics execution finished on {{name}}", origin) };
        }

        yield { message: i18n.t("Preparing synchronization") };

        // Build instance list
        const targetInstances = _.compact(await promiseMap(targetInstanceIds, id => this.getInstanceById(id)));

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
                message: i18n.t("Importing in instance {{instance}}", {
                    instance: instance.name,
                    interpolation: { escapeValue: false },
                }),
            };

            try {
                debug("Start import on destination instance", instance.toPublicObject());

                const syncResults = await this.postPayload(instance);
                syncReport.addSyncResult(...syncResults);

                debug("Finished import on instance", instance.toPublicObject());
            } catch (error: any) {
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

        // Phase 4: Update sync rule last executed date and last executed user name and id
        if (syncRule) {
            const oldRule = await this.repositoryFactory.rulesRepository(this.localInstance).getById(syncRule);

            if (oldRule) {
                const currentUser = await this.api.currentUser
                    .get({ fields: { userCredentials: { name: true }, id: true } })
                    .getData();
                const updatedRule = oldRule.updateLastExecuted(new Date(), {
                    id: currentUser.id,
                    name: currentUser.userCredentials.name,
                });
                await this.repositoryFactory.rulesRepository(this.localInstance).save([updatedRule]);
            }
        }

        // Phase 5: Update parent task status
        syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
        yield { syncReport, done: true };

        return syncReport;
    }
}
