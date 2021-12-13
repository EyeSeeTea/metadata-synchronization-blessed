import { Either } from "../../domain/common/entities/Either";
import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { DataSourceMapping } from "../../domain/mapping/entities/DataSourceMapping";
import { isMappingOwnerStore, MappingOwner } from "../../domain/mapping/entities/MappingOwner";
import { MappingRepository, SaveMappingError } from "../../domain/mapping/repositories/MappingRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { Namespace } from "../storage/Namespaces";

export class MappingD2ApiRepository implements MappingRepository {
    constructor(private configRepository: ConfigRepository) {}

    async getByOwner(owner: MappingOwner): Promise<DataSourceMapping | undefined> {
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

    async save(mapping: DataSourceMapping): Promise<Either<SaveMappingError, void>> {
        try {
            const storageClient = await this.getStorageClient();

            await storageClient.saveObjectInCollection(Namespace.MAPPINGS, mapping.toObject());

            return Either.success(undefined);
        } catch (error) {
            return Either.error("UNEXPECTED_ERROR");
        }
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
