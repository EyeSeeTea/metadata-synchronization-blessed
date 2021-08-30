import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class CleanSyncReportsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public execute(): Promise<void> {
        return this.repositoryFactory.reportsRepository(this.localInstance).clean();
    }
}
