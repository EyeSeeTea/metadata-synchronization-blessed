import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class DeleteSyncReportUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<void> {
        await this.repositoryFactory.reportsRepository(this.localInstance).delete(id);
    }
}
