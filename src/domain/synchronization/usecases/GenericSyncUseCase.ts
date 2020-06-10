import { D2Api } from "d2-api/2.30";
import _ from "lodash";
import memoize from "nano-memoize";
import i18n from "../../../locales";
import Instance from "../../../models/instance";
import SyncReport from "../../../models/syncReport";
import SyncRule from "../../../models/syncRule";
import { D2 } from "../../../types/d2";
import { SynchronizationBuilder } from "../../../types/synchronization";
import { promiseMap } from "../../../utils/common";
import { getMetadata } from "../../../utils/synchronization";
import { AggregatedPackage } from "../../aggregated/entities/AggregatedPackage";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { EventsPackage } from "../../events/entities/EventsPackage";
import { EventsSyncUseCase } from "../../events/usecases/EventsSyncUseCase";
import InstanceEntity from "../../instance/entities/Instance";
import InstanceRepository from "../../instance/repositories/InstanceRepository";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { DeletedMetadataSyncUseCase } from "../../metadata/usecases/DeletedMetadataSyncUseCase";
import { MetadataSyncUseCase } from "../../metadata/usecases/MetadataSyncUseCase";
import {
    AggregatedDataStats,
    EventsDataStats,
    SynchronizationReportStatus,
} from "../entities/SynchronizationReport";
import { SynchronizationResult, SynchronizationStatus } from "../entities/SynchronizationResult";
import { SyncRuleType } from "../entities/SynchronizationRule";

export type SyncronizationClass =
    | typeof MetadataSyncUseCase
    | typeof AggregatedSyncUseCase
    | typeof EventsSyncUseCase
    | typeof DeletedMetadataSyncUseCase;
export type SyncronizationPayload = MetadataPackage | AggregatedPackage | EventsPackage;

export abstract class GenericSyncUseCase {
    public abstract readonly type: SyncRuleType;
    public readonly fields: string = "id,name";

    constructor(
        protected readonly d2: D2,
        protected readonly api: D2Api,
        protected readonly builder: SynchronizationBuilder,
        protected readonly instanceRepository: InstanceRepository
    ) {}

    public abstract async buildPayload(): Promise<SyncronizationPayload>;
    public abstract async mapPayload(
        instance: Instance,
        payload: SyncronizationPayload
    ): Promise<SyncronizationPayload>;

    // We start to use domain concepts:
    // for the moment old model instance and domain entity instance are going to live together for a while on sync classes.
    // Little by little through refactors the old instance model should disappear
    public abstract async postPayload(
        instance: Instance,
        instanceEntity: InstanceEntity
    ): Promise<SynchronizationResult[]>;
    public abstract async buildDataStats(): Promise<
        AggregatedDataStats[] | EventsDataStats[] | undefined
    >;

    public extractMetadata = memoize(async () => {
        const cleanIds = this.builder.metadataIds.map(id => _.last(id.split("-")) ?? id);
        return getMetadata(this.api, cleanIds, this.fields);
    });

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

    public async *execute() {
        const { targetInstances: targetInstanceIds, syncRule } = this.builder;
        yield { message: i18n.t("Preparing synchronization") };

        // Build instance list
        const targetInstances = _.compact(
            await promiseMap(targetInstanceIds, id => Instance.get(this.api, id))
        );

        // Initialize sync report
        const syncReport = await this.buildSyncReport();
        syncReport.addSyncResult(
            ...targetInstances.map(instance => ({
                instance: instance.toObject(),
                status: "PENDING" as SynchronizationStatus,
                date: new Date(),
                type: this.type,
            }))
        );

        yield { syncReport };
        for (const instance of targetInstances) {
            yield {
                message: i18n.t("Importing data in instance {{instance}}", {
                    instance: instance.name,
                    interpolation: { escapeValue: false },
                }),
            };

            try {
                console.debug("Start import on destination instance", instance.toObject());

                const instanceEntity = await this.instanceRepository.getById(instance.id);
                const syncResults = await this.postPayload(instance, instanceEntity);
                syncReport.addSyncResult(...syncResults);

                console.debug("Finished importing data on instance", instance.toObject());
            } catch (error) {
                syncReport.addSyncResult({
                    status: "ERROR",
                    message: error.message,
                    instance: instance.toObject(),
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
