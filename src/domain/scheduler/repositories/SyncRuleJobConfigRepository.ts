import { SyncRuleJobConfig } from "../entities/SyncRuleJobConfig";
import { User } from "../../user/entities/User";
import { Instance } from "../../instance/entities/Instance";

export interface SyncRuleJobConfigRepositoryConstructor {
    new (instance: Instance): SyncRuleJobConfigRepository;
}

export interface SyncRuleJobConfigRepository {
    getAll(currentUser: User): Promise<SyncRuleJobConfig[]>;
}
