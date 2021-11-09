import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { DataSourceMapping } from "../entities/DataSourceMapping";

export type SaveMappingError = "UNEXPECTED_ERROR" | "INSTANCE_NOT_FOUND";

export class SaveMappingUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, protected localInstance: Instance) {}

    public async execute(mapping: DataSourceMapping): Promise<Either<SaveMappingError, void>> {
        const storageClient = await this.getStorageClient();

        await storageClient.saveObjectInCollection(Namespace.MAPPINGS, mapping.toObject());

        return Either.success(undefined);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.repositoryFactory.configRepository(this.localInstance).getStorageClient();
    }
}
