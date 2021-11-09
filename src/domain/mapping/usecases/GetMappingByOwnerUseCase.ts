import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { isMappingOwnerStore, MappingOwner } from "../entities/MappingOwner";

export class GetMappingByOwnerUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, protected localInstance: Instance) {}

    public async execute(owner: MappingOwner): Promise<DataSourceMapping | undefined> {
        const storageClient = await this.getStorageClient();

        const mappings = await storageClient.listObjectsInCollection<DataSourceMapping>(Namespace.MAPPINGS);

        const rawMapping = mappings.find(
            mapping =>
                (isMappingOwnerStore(mapping.owner) &&
                    isMappingOwnerStore(owner) &&
                    mapping.owner.id === owner.id &&
                    mapping.owner.moduleId === owner.moduleId) ||
                mapping.owner.id === owner.id
        );

        if (rawMapping) {
            const mappingRawWithMetadataMapping = await storageClient.getObjectInCollection<DataSourceMapping>(
                Namespace.MAPPINGS,
                rawMapping?.id
            );

            return mappingRawWithMetadataMapping
                ? DataSourceMapping.build({ ...mappingRawWithMetadataMapping })
                : undefined;
        } else {
            return undefined;
        }
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.repositoryFactory.configRepository(this.localInstance).getStorageClient();
    }
}
