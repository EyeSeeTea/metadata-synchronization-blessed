import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SchedulerExecution } from "../entities/SchedulerExecution";

export class GetLastSchedulerExecutionUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public execute(): Promise<SchedulerExecution> {
        return this.repositoryFactory.schedulerRepository(this.localInstance).getLastExecution();
    }
}
