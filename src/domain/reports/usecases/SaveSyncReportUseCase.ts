import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationReport } from "../entities/SynchronizationReport";

export class SaveSyncReportUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(report: SynchronizationReport): Promise<void> {
        await this.repositoryFactory.reportsRepository(this.localInstance).save(report);
    }
}
