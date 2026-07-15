import { SynchronizationRule, SynchronizationRuleData } from "../../domain/rules/entities/SynchronizationRule";
import { RulesRepository } from "../../domain/rules/repositories/RulesRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { UserRepository } from "../../domain/user/repositories/UserRepository";
import { Namespace } from "../storage/Namespaces";
import { StorageClientFactory } from "../config/StorageClientFactory";
import { AggregatedDataExchange } from "../aggregated/models/AggregatedDataExchange";
import { SyncRulePersistedData } from "./models/SyncRulePersistedData";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { Instance } from "../../domain/instance/entities/Instance";
import { D2Api } from "../../types/d2-api";
import { isDhisInstance } from "../../domain/instance/entities/DataSource";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { promiseMap } from "../../utils/common";
import { InstanceDataStoreData } from "../instance/InstanceD2ApiRepository";
import _, { isArray } from "lodash";
import { buildPeriodFromParams, buildPeriodsForAggregation } from "../../domain/aggregated/utils";
import { MetadataType } from "../../utils/d2";
import { getAggregatedDataExchanges } from "../aggregated/getAggregateDataExchange";
import { getAggregatedDataExchangeJobConfigurations } from "../aggregated/getAggregatedDataExchangeJobConfigurations";
import { toSynchronizationRulePersistedSnapshot } from "../../domain/rules/PersistedSnapshot";
import { getRuleAggregatedDataExchanges } from "./utils/getRuleAggregatedDataExchanges";
import { buildAggregatedDataExchangePayload } from "./utils/buildAggregatedDataExchangePayload";

export class RulesD2ApiRepository implements RulesRepository {
    private api: D2Api;

    constructor(
        private instance: Instance,
        private storageClientFactory: StorageClientFactory,
        private userRepository: UserRepository
    ) {
        if (!isDhisInstance(this.instance)) {
            throw new Error("Invalid instance type for MetadataD2ApiRepository");
        }

        this.api = getD2APiFromInstance(this.instance);
    }

    public async getById(id: string): Promise<SynchronizationRule | undefined> {
        const storageClient = await this.getStorageClient();
        const data = await storageClient.getObjectInCollection<SynchronizationRuleData>(Namespace.RULES, id);

        if (!data) {
            return undefined;
        }

        if (data.aggregatedDataExchanges && data.aggregatedDataExchanges.length > 0) {
            const instances = await this.getInstances();

            const dataWithADEX = {
                ...data,
                aggregatedDataExchanges: await getRuleAggregatedDataExchanges(
                    this.api,
                    data.aggregatedDataExchanges,
                    instances
                ),
            };
            return SynchronizationRule.build(dataWithADEX);
        } else {
            return data ? SynchronizationRule.build(data) : undefined;
        }
    }

    public async getSyncResults(id: string): Promise<SynchronizationRule[]> {
        const storageClient = await this.getStorageClient();
        const data = await storageClient.getObject<SynchronizationRule[]>(`${Namespace.RULES}-${id}`);

        return data ?? [];
    }

    public async list(allProperties?: boolean): Promise<SynchronizationRule[]> {
        const rulesData = await this.getRulesData(allProperties);
        return rulesData.map(ruleData => SynchronizationRule.build(ruleData));
    }

    public async save(rules: SynchronizationRule[]): Promise<void> {
        const originalAggregatedDataExchangeIds = await this.getOriginalAggregatedDataExchangeIds(rules);
        const originalAggregatedDataExchangeJobIds = await this.getOriginalAggregatedDataExchangeJobIds(rules);

        const user = await this.userRepository.getCurrent();

        //TODO: This business rule logic should be realized in the entity
        const data: SynchronizationRuleData[] = rules.map(rule => {
            return {
                ...rule
                    .update({
                        lastUpdated: new Date(),
                        lastUpdatedBy: { id: user.id, name: user.name },
                    })
                    .toObject(),
            };
        });

        const instances = await this.getInstances();

        const aggregateDataExchanges = await this.buildAggregatedDataExchanges(data, instances);

        await this.deleteOrphanAggregatedDataExchanges(originalAggregatedDataExchangeIds, aggregateDataExchanges);

        await promiseMap(aggregateDataExchanges, async ade => {
            await this.saveAggregatedDataExchange(ade);
        });

        const jobConfigurations = await this.buildAggregatedDataExchangeJobs(data);

        await this.deleteOrphanAggregatedDataExchangeJobs(
            originalAggregatedDataExchangeJobIds,
            jobConfigurations.map(job => job.id)
        );

        await promiseMap(jobConfigurations, async job => {
            await this.saveAggregatedDataExchangeJobConfiguration(job);
        });

        const rulesToSave = data.map(ruleData => toSynchronizationRulePersistedSnapshot(ruleData));

        const storageClient = await this.getStorageClient();
        await storageClient.saveObjectsInCollection<SyncRulePersistedData>(Namespace.RULES, rulesToSave);
    }

    public async delete(id: string): Promise<void> {
        const runcRule = await this.getById(id);

        if (runcRule) {
            if (runcRule.aggregatedDataExchanges) {
                await promiseMap(runcRule.aggregatedDataExchanges, async ade => {
                    return this.deleteAggregatedDataExchange(ade.id);
                });
            }

            if (runcRule.aggregatedDataExchangeDhis2Job) {
                await this.deleteAggregatedDataExchangeJob(runcRule.aggregatedDataExchangeDhis2Job.id);
            }
        }

        const storageClient = await this.getStorageClient();
        await storageClient.removeObjectInCollection(Namespace.RULES, id);
    }

    private async getRulesData(allProperties?: boolean): Promise<SynchronizationRuleData[]> {
        const storageClient = await this.getStorageClient();

        if (allProperties) {
            return storageClient.getObjectsInCollection<SynchronizationRuleData>(Namespace.RULES);
        } else {
            return storageClient.listObjectsInCollection<SynchronizationRuleData>(Namespace.RULES);
        }
    }

    private async getInstances(): Promise<InstanceDataStoreData[]> {
        const storageClient = await this.getStorageClient();

        return storageClient.listObjectsInCollection<InstanceDataStoreData>(Namespace.INSTANCES);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.storageClientFactory.getStorageClientPromise();
    }

    private async getOriginalAggregatedDataExchangeIds(rules: SynchronizationRule[]) {
        const ruleIds = rules.map(rule => rule.id);
        const originalRules = (await this.getRulesData(true)).filter(rule => ruleIds.includes(rule.id));
        const originalAggregatedDataExchangeIds: string[] = originalRules
            .map(rule => rule.aggregatedDataExchanges || [])
            .flat()
            .map(ruleAdex => ruleAdex.id);
        return originalAggregatedDataExchangeIds;
    }

    private async deleteOrphanAggregatedDataExchanges(
        originalAggregatedDataExchanges: string[],
        aggregateDataExchanges: AggregatedDataExchange[]
    ) {
        const aggregatedDataExchangeIdsToRemove = originalAggregatedDataExchanges.filter(
            originalAdexId =>
                !aggregateDataExchanges.find(aggregateDataExchange => aggregateDataExchange.id === originalAdexId)
        );

        await promiseMap(aggregatedDataExchangeIdsToRemove, async adeId => {
            await this.deleteAggregatedDataExchange(adeId);
        });
    }

    private async buildAggregatedDataExchanges(
        rulesData: SynchronizationRuleData[],
        instances: InstanceDataStoreData[]
    ): Promise<AggregatedDataExchange[]> {
        const aggregatedDataExchangeRules = rulesData.filter(
            ruleData =>
                ruleData.useAggregatedDataExchange &&
                ruleData.aggregatedDataExchanges &&
                ruleData.aggregatedDataExchanges.length > 0
        );

        const aggregateDataExchange = await promiseMap(aggregatedDataExchangeRules, async ruleData => {
            const { orgUnitPaths = [], aggregationType } = ruleData.builder.dataParams || {};

            const { startDate, endDate } = buildPeriodFromParams(ruleData.builder.dataParams || {});
            const periods = buildPeriodsForAggregation(aggregationType, startDate, endDate);
            const orgUnits = cleanOrgUnitPaths(orgUnitPaths);
            const metadataIds = ruleData.builder.metadataIds || [];

            const orgUnitCodes = await this.getMetadataCodesByIds(orgUnits);
            const metadataCodes = await this.getMetadataCodesByIds(metadataIds);

            return ruleData.aggregatedDataExchanges!.map(ade => {
                const instance = instances.find(
                    inst => inst.id === ade.target.instanceId && inst.type === "aggregated-data-exchange"
                );

                return buildAggregatedDataExchangePayload(ade, ruleData.name, instance, {
                    periods,
                    orgUnits,
                    orgUnitCodes,
                    metadataIds,
                    metadataCodes,
                });
            });
        });

        return aggregateDataExchange.flat();
    }

    private async getMetadataCodesByIds(metadataIds: string[]): Promise<string[]> {
        const params = {
            fields: "id,code",
            filter: "id:in:[" + metadataIds.join(",") + "]",
        };

        const response = await this.api.get<Record<string, MetadataType[]>>(`/metadata`, params).getData();

        const allMetadata = Object.values(response)
            .filter(item => isArray(item))
            .flat();

        return allMetadata.map(item => item.code);
    }

    private async saveAggregatedDataExchange(aggregateDataExchange: AggregatedDataExchange) {
        const existedAggregatedDataExchanges = await getAggregatedDataExchanges(this.api, [aggregateDataExchange.id]);

        const existedAggregatedDataExchange = existedAggregatedDataExchanges[0];

        if (!existedAggregatedDataExchange) {
            await this.api.post("/aggregateDataExchanges", {}, aggregateDataExchange).getData();
        } else {
            const cleanExisted = existedAggregatedDataExchange
                ? JSON.parse(JSON.stringify(existedAggregatedDataExchange))
                : undefined;
            const cleanNew = JSON.parse(JSON.stringify(aggregateDataExchange));

            const hasChanged = !_.isEqual(cleanExisted, cleanNew);

            if (hasChanged) {
                if (
                    aggregateDataExchange.target.api?.url &&
                    !aggregateDataExchange.target.api.password &&
                    !aggregateDataExchange.target.api.token
                ) {
                    throw new Error(
                        `Cannot save Aggregated Data Exchange ${aggregateDataExchange.id} without authentication details. Please provide username/password or token.`
                    );
                }

                await this.api
                    .put(`/aggregateDataExchanges/${aggregateDataExchange.id}`, {}, aggregateDataExchange)
                    .getData();
            }
        }
    }

    private async deleteAggregatedDataExchange(aggregatedDataExchangeId: string) {
        try {
            await this.api.delete(`aggregateDataExchanges/${aggregatedDataExchangeId}`, {}).getData();
        } catch (error) {
            console.error(`Error deleting Aggregated Data Exchange ${aggregatedDataExchangeId}:`, error);
        }
    }

    private async getOriginalAggregatedDataExchangeJobIds(rules: SynchronizationRule[]) {
        const ruleIds = rules.map(rule => rule.id);
        const originalRules = (await this.getRulesData(true)).filter(rule => ruleIds.includes(rule.id));
        const originalAggregatedDataExchangeJobIds: string[] = originalRules
            .filter(rule => rule.aggregatedDataExchangeDhis2Job)
            .map(rule => rule.aggregatedDataExchangeDhis2Job)
            .map(ruleJob => ruleJob!.id);
        return originalAggregatedDataExchangeJobIds;
    }

    private async deleteOrphanAggregatedDataExchangeJobs(
        originalAggregatedDataExchangeJobIds: string[],
        aggregateDataExchangeJobIds: string[]
    ) {
        const aggregatedDataExchangeIdsToRemove = originalAggregatedDataExchangeJobIds.filter(
            originalId => !aggregateDataExchangeJobIds.includes(originalId)
        );

        await promiseMap(aggregatedDataExchangeIdsToRemove, async adeId => {
            await this.deleteAggregatedDataExchangeJob(adeId);
        });
    }

    private async buildAggregatedDataExchangeJobs(rulesData: SynchronizationRuleData[]): Promise<D2JobConfiguration[]> {
        const rulesWithAggregatedDataExchangeJob = rulesData.filter(
            ruleData => ruleData.useAggregatedDataExchangeDhis2Job && ruleData.aggregatedDataExchangeDhis2Job
        );

        const jobConfigurations = rulesWithAggregatedDataExchangeJob
            .map(rule => {
                const adexId = rule.aggregatedDataExchanges?.map(ade => ade.id);

                return {
                    id: rule.aggregatedDataExchangeDhis2Job!.id || "",
                    name: `Metadata Sync aggregated data exchange job for: ${rule.name}`,
                    cronExpression: rule.frequency || "",
                    jobType: "AGGREGATE_DATA_EXCHANGE" as const,
                    jobParameters: { dataExchangeIds: adexId || [] },
                };
            })
            .flat();

        return jobConfigurations;
    }

    private async saveAggregatedDataExchangeJobConfiguration(jobConfiguration: D2JobConfiguration) {
        try {
            const existedJobs = await getAggregatedDataExchangeJobConfigurations(this.api, [jobConfiguration.id]);

            const existedJob = existedJobs[0];

            if (!existedJob) {
                await this.api.post("/jobConfigurations", {}, jobConfiguration).getData();
            } else {
                await this.api.put(`/jobConfigurations/${jobConfiguration.id}`, {}, jobConfiguration).getData();
            }
        } catch (error) {
            console.error(`Error saving Job Configuration ${jobConfiguration.id}:`, error);
            throw error;
        }
    }

    private async deleteAggregatedDataExchangeJob(jobId: string) {
        try {
            await this.api.delete(`jobConfigurations/${jobId}`, {}).getData();
        } catch (error) {
            console.error(`Error deleting Job Configuration ${jobId}:`, error);
        }
    }
}

type D2JobConfiguration = {
    id: string;
    name: string;
    cronExpression: string;
    jobType: "AGGREGATE_DATA_EXCHANGE";
    jobParameters: { dataExchangeIds: string[] };
};
