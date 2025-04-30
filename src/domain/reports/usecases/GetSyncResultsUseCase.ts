import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../entities/SynchronizationResult";

export class GetSyncResultsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<SynchronizationResult[]> {
        return this.repositoryFactory.reportsRepository(this.localInstance).getSyncResults(id);
    }
}
