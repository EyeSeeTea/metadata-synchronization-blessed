import { SynchronizationRule, SynchronizationRuleData } from "../../domain/rules/entities/SynchronizationRule";
import { SyncRuleJobConfigRepository } from "../../domain/scheduler/repositories/SyncRuleJobConfigRepository";
import { User } from "../../domain/user/entities/User";
import { SyncRuleJobConfig } from "../../domain/scheduler/entities/SyncRuleJobConfig";
import { Namespace } from "../storage/Namespaces";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
import { Instance } from "../../domain/instance/entities/Instance";

export class SyncRuleJobConfigD2ApiRepository implements SyncRuleJobConfigRepository {
    private dataStoreClient: StorageDataStoreClient;

    constructor(private instance: Instance) {
        this.dataStoreClient = new StorageDataStoreClient(this.instance);
    }

    public async getAll(currentUser: User): Promise<SyncRuleJobConfig[]> {
        const synchRulesToBeScheduled = await this.getAllSynchronizationRules(currentUser);

        const validSyncRuleJobConfigs = this.mapSynchronizationRulesToSyncRuleJobConfigs(synchRulesToBeScheduled);

        return validSyncRuleJobConfigs;
    }

    private async getAllSynchronizationRules(currentUser: User): Promise<SynchronizationRule[]> {
        const storedSynchronizationRuleData =
            await this.dataStoreClient.listObjectsInCollection<SynchronizationRuleData>(Namespace.RULES);

        const syncRules = storedSynchronizationRuleData.map(data => SynchronizationRule.build(data));

        const synchRulesToBeScheduled = syncRules.filter(rule => rule.enabled);

        const allowedSynchRulesToBeScheduled = synchRulesToBeScheduled.filter(
            rule => currentUser.isGlobalAdmin || rule.isVisibleToUser(currentUser)
        );

        return allowedSynchRulesToBeScheduled;
    }

    private mapSynchronizationRulesToSyncRuleJobConfigs(syncRule: SynchronizationRule[]): SyncRuleJobConfig[] {
        return syncRule.reduce((acc: SyncRuleJobConfig[], syncRule: SynchronizationRule): SyncRuleJobConfig[] => {
            if (syncRule.frequency) {
                return [
                    ...acc,
                    {
                        id: syncRule.id,
                        name: syncRule.name,
                        frequency: syncRule.frequency,
                    },
                ];
            } else {
                return acc;
            }
        }, []);
    }
}
