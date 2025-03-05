import { SynchronizationRule, SynchronizationRuleData } from "../../domain/rules/entities/SynchronizationRule";
import { SyncRuleJobConfigRepository } from "../../domain/scheduler/repositories/SyncRuleJobConfigRepository";
import { User } from "../../domain/user/entities/User";
import { SyncRuleJobConfig } from "../../domain/scheduler/entities/SyncRuleJobConfig";
import { Namespace } from "../storage/Namespaces";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
import { Instance } from "../../domain/instance/entities/Instance";
import { Future, FutureData } from "../../domain/common/entities/Future";

/**
 * @todo This file is refactored but in the constructor instead of Instance we should get D2Api or directly DataStoreClient
 */
export class SyncRuleJobConfigD2ApiRepository implements SyncRuleJobConfigRepository {
    private dataStoreClient: StorageDataStoreClient;

    constructor(private instance: Instance) {
        this.dataStoreClient = new StorageDataStoreClient(this.instance);
    }

    public getAll(currentUser: User): FutureData<SyncRuleJobConfig[]> {
        return this.getAllSynchronizationRules(currentUser).flatMap(synchRulesToBeScheduled => {
            const validSyncRuleJobConfigs = this.mapSynchronizationRulesToSyncRuleJobConfigs(synchRulesToBeScheduled);

            return Future.success(validSyncRuleJobConfigs);
        });
    }

    private getAllSynchronizationRules(currentUser: User): FutureData<SynchronizationRule[]> {
        return Future.fromPromise(
            this.dataStoreClient.listObjectsInCollection<SynchronizationRuleData>(Namespace.RULES)
        ).flatMap(storedSynchronizationRuleData => {
            const syncRules = storedSynchronizationRuleData.map(data => SynchronizationRule.build(data));
            const synchRulesToBeScheduled = syncRules.filter(rule => rule.enabled);
            const allowedSynchRulesToBeScheduled = synchRulesToBeScheduled.filter(
                rule => currentUser.isGlobalAdmin || rule.isVisibleToUser(currentUser)
            );

            return Future.success(allowedSynchRulesToBeScheduled);
        });
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
