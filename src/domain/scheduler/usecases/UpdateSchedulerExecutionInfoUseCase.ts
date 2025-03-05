import { FutureData } from "../../common/entities/Future";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";

/**
 * @todo Do not pass RepositoryFactory and Instance, only pass the necessary repositories
 */
export class UpdateSchedulerExecutionInfoUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public execute(executionInfo: SchedulerExecutionInfo): FutureData<void> {
        return this.repositoryFactory
            .schedulerExecutionInfoRepository(this.localInstance)
            .updateExecutionInfo(executionInfo);
    }
}
