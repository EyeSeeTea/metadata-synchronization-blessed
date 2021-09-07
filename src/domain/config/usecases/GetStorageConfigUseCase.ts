import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class GetStorageConfigUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<"dataStore" | "constant"> {
        const client = await this.repositoryFactory.configRepository(this.localInstance).getStorageClient();

        return client.type;
    }
}
