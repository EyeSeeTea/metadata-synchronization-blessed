import { SyncRuleJobConfig } from "../entities/SyncRuleJobConfig";
import { User } from "../../user/entities/User";
import { Instance } from "../../instance/entities/Instance";
import { FutureData } from "../../common/entities/Future";

/**
 * @todo This file is refactored but we need to remove SyncRuleJobConfigRepositoryConstructor concept
 */
export interface SyncRuleJobConfigRepositoryConstructor {
    new (instance: Instance): SyncRuleJobConfigRepository;
}

export interface SyncRuleJobConfigRepository {
    getAll(currentUser: User): FutureData<SyncRuleJobConfig[]>;
}
