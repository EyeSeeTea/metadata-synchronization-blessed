import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { isMappingStoreOwner, Mapping } from "../entities/Mapping";

export type SaveMappingError = "UNEXPECTED_ERROR" | "INSTANCE_NOT_FOUND";

export class SaveMappingUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(mapping: Mapping): Promise<Either<SaveMappingError, void>> {
        if (isMappingStoreOwner(mapping.owner)) {
            await this.storageRepository.saveObjectInCollection(
                Namespace.MAPPINGS,
                mapping.toObject()
            );

            return Either.success(undefined);
        } else {
            const rawInstance = await this.storageRepository.getObjectInCollection<InstanceData>(
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

                await this.storageRepository.saveObjectInCollection(
                    Namespace.INSTANCES,
                    updatedInstance.toObject()
                );

                return Either.success(undefined);
            }
        }
    }
}
