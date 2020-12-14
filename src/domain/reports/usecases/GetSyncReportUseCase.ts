import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationReport } from "../entities/SynchronizationReport";

export class GetSyncReportUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<SynchronizationReport | undefined> {
        return this.repositoryFactory.reportsRepository(this.localInstance).getById(id);
    }
}
