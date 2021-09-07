import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { isMappingOwnerStore } from "../entities/MappingOwner";

export type SaveMappingError = "UNEXPECTED_ERROR" | "INSTANCE_NOT_FOUND";

export class SaveMappingUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, protected localInstance: Instance) {}

    public async execute(mapping: DataSourceMapping): Promise<Either<SaveMappingError, void>> {
        const storageClient = await this.getStorageClient();

        if (isMappingOwnerStore(mapping.owner)) {
            await storageClient.saveObjectInCollection(Namespace.MAPPINGS, mapping.toObject());

            return Either.success(undefined);
        } else {
            const rawInstance = await storageClient.getObjectInCollection<InstanceData>(
                Namespace.INSTANCES,
                mapping.owner.id
            );

            if (!rawInstance) {
                return Either.error("INSTANCE_NOT_FOUND");
            } else {
                const instance = Instance.build({ ...rawInstance });

                const updatedInstance = instance.update({
                    metadataMapping: mapping.mappingDictionary,
                });

                await storageClient.saveObjectInCollection(Namespace.INSTANCES, updatedInstance.toObject());

                return Either.success(undefined);
            }
        }
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.repositoryFactory.configRepository(this.localInstance).getStorageClient();
    }
}
