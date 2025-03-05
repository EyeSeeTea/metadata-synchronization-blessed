import { Future, FutureData } from "../../common/entities/Future";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SyncRuleJobConfig } from "../entities/SyncRuleJobConfig";

/**
 * @todo Do not pass RepositoryFactory and Instance, only pass the necessary repositories
 */
export class GetSyncRuleJobConfigsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public execute(): FutureData<SyncRuleJobConfig[]> {
        return Future.fromPromise(this.repositoryFactory.userRepository(this.localInstance).getCurrent()).flatMap(
            currentUser => {
                return this.repositoryFactory
                    .syncRuleJobConfigRepository(this.localInstance)
                    .getAll(currentUser)
                    .flatMap(syncRuleJobConfigs => {
                        return Future.success(syncRuleJobConfigs);
                    });
            }
        );
    }
}
