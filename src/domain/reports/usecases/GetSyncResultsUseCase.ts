import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../entities/SynchronizationResult";

export class GetSyncResultsUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<SynchronizationResult[]> {
        return this.repositoryFactory.reportsRepository(this.localInstance).getSyncResults(id);
    }
}
