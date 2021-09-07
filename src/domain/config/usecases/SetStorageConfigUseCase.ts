import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class SetStorageConfigUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(client: "dataStore" | "constant"): Promise<void> {
        await this.repositoryFactory.configRepository(this.localInstance).changeStorageClient(client);
    }
}
