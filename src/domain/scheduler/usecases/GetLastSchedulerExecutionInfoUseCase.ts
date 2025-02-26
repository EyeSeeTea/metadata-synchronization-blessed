import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";

export class GetLastSchedulerExecutionInfoUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public execute(): Promise<SchedulerExecutionInfo> {
        return this.repositoryFactory.schedulerExecutionInfoRepository(this.localInstance).getLastExecutionInfo();
    }
}
