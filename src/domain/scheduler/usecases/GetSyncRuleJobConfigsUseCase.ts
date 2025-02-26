import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SyncRuleJobConfig } from "../entities/SyncRuleJobConfig";

export class GetSyncRuleJobConfigsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<SyncRuleJobConfig[]> {
        const currentUser = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();
        const syncRuleJobConfigs = await this.repositoryFactory
            .syncRuleJobConfigRepository(this.localInstance)
            .getAll(currentUser);

        return syncRuleJobConfigs;
    }
}
