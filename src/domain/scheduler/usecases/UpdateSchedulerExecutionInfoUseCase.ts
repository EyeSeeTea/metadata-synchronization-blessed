import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";

export class UpdateSchedulerExecutionInfoUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public execute(executionInfo: SchedulerExecutionInfo): Promise<void> {
        return this.repositoryFactory
            .schedulerExecutionInfoRepository(this.localInstance)
            .updateExecutionInfo(executionInfo);
    }
}
