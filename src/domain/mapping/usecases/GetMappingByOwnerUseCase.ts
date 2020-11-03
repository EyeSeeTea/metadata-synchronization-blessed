import { UseCase } from "../../common/entities/UseCase";
import { Instance } from "../../instance/entities/Instance";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { isMappingOwnerStore, MappingOwner } from "../entities/MappingOwner";

export class GetMappingByOwnerUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(owner: MappingOwner): Promise<DataSourceMapping | undefined> {
        if (isMappingOwnerStore(owner)) {
            const mappings = await this.storageRepository.listObjectsInCollection<
                DataSourceMapping
            >(Namespace.MAPPINGS);

            const rawMapping = mappings.find(
                mapping =>
                    isMappingOwnerStore(mapping.owner) &&
                    mapping.owner.id === owner.id &&
                    mapping.owner.moduleId === owner.moduleId
            );

            if (rawMapping) {
                const mappingRawWithMetadataMapping = await this.storageRepository.getObjectInCollection<
                    DataSourceMapping
                >(Namespace.MAPPINGS, rawMapping?.id);

                return mappingRawWithMetadataMapping
                    ? DataSourceMapping.build({ ...mappingRawWithMetadataMapping })
                    : undefined;
            } else {
                return undefined;
            }
        } else {
            const instance = await this.storageRepository.getObjectInCollection<Instance>(
                Namespace.INSTANCES,
                owner.id
            );

            return instance
                ? DataSourceMapping.build({
                      owner: { type: "instance", id: instance.id },
                      mappingDictionary: instance.metadataMapping ?? {},
                  })
                : undefined;
        }
    }
}
