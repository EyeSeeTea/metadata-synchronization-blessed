import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { SynchronizationRule, SynchronizationRuleData } from "../../domain/rules/entities/SynchronizationRule";
import { SyncRuleJobConfigRepository } from "../../domain/scheduler/repositories/SyncRuleJobConfigRepository";
import { User } from "../../domain/user/entities/User";
import { SyncRuleJobConfig } from "../../domain/scheduler/entities/SyncRuleJobConfig";
import { Namespace } from "../storage/Namespaces";

// TODO: remove coupling with ConfigRepository repository having in the constructor directly the StorageClient
export class SyncRuleJobConfigD2ApiRepository implements SyncRuleJobConfigRepository {
    constructor(private configRepository: ConfigRepository) {}

    public async getAll(currentUser: User): Promise<SyncRuleJobConfig[]> {
        const synchRulesToBeScheduled = await this.getAllSynchronizationRules(currentUser);

        const validSyncRuleJobConfigs = this.mapSynchronizationRulesToSyncRuleJobConfigs(synchRulesToBeScheduled);

        return validSyncRuleJobConfigs;
    }

    private async getAllSynchronizationRules(currentUser: User): Promise<SynchronizationRule[]> {
        const storageClient = await this.configRepository.getStorageClient();
        const storedSynchronizationRuleData = await storageClient.listObjectsInCollection<SynchronizationRuleData>(
            Namespace.RULES
        );

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
