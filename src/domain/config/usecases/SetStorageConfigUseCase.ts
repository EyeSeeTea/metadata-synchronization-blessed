import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { StorageType } from "../entities/Config";

export class SetStorageConfigUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(client: StorageType): Promise<void> {
        await this.repositoryFactory.configRepository(this.localInstance).changeStorageClient(client);
    }
}
