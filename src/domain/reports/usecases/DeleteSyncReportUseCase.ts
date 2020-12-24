import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class DeleteSyncReportUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<void> {
        await this.repositoryFactory.reportsRepository(this.localInstance).delete(id);
    }
}
