import { UseCase } from "../../common/entities/UseCase";
import { Instance } from "../../instance/entities/Instance";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { isMappingStoreOwner, Mapping, MappingOwner } from "../entities/Mapping";

export class GetMappingByOwnerUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(owner: MappingOwner): Promise<Mapping | undefined> {
        if (isMappingStoreOwner(owner)) {
            const mappings = await this.storageRepository.listObjectsInCollection<Mapping>(
                Namespace.MAPPINGS
            );

            const rawMapping = mappings.find(
                mapping =>
                    isMappingStoreOwner(mapping.owner) &&
                    mapping.owner.id === owner.id &&
                    mapping.owner.moduleId === owner.moduleId
            );

            if (rawMapping) {
                const mappingRawWithMetadataMapping = await this.storageRepository.getObjectInCollection<
                    Mapping
                >(Namespace.MAPPINGS, rawMapping?.id);
                return mappingRawWithMetadataMapping
                    ? Mapping.createExisted({ ...mappingRawWithMetadataMapping })
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
                ? Mapping.createNew({
                      owner: { id: instance.id },
                      ownerType: "INSTANCE",
                      metadataMapping: instance?.metadataMapping,
                  })
                : undefined;
        }
    }
}
