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

        if (isMappingOwnerStore(owner)) {
            const mappings = await storageClient.listObjectsInCollection<DataSourceMapping>(Namespace.MAPPINGS);

            const rawMapping = mappings.find(
                mapping =>
                    isMappingOwnerStore(mapping.owner) &&
                    mapping.owner.id === owner.id &&
                    mapping.owner.moduleId === owner.moduleId
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
        } else {
            const instance = await storageClient.getObjectInCollection<Instance>(Namespace.INSTANCES, owner.id);

            return instance
                ? DataSourceMapping.build({
                      owner: { type: "instance", id: instance.id },
                      mappingDictionary: instance.metadataMapping ?? {},
                  })
                : undefined;
        }
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.repositoryFactory.configRepository(this.localInstance).getStorageClient();
    }
}
