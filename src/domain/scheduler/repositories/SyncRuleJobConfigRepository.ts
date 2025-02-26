import { SyncRuleJobConfig } from "../entities/SyncRuleJobConfig";
import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { User } from "../../user/entities/User";

export interface SyncRuleJobConfigRepositoryConstructor {
    // TODO: remove coupling with ConfigRepository repository having in the constructor directly the StorageClient
    new (configRepository: ConfigRepository): SyncRuleJobConfigRepository;
}

export interface SyncRuleJobConfigRepository {
    getAll(currentUser: User): Promise<SyncRuleJobConfig[]>;
}
