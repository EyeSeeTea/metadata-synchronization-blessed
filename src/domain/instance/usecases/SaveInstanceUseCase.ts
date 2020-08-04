import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Instance } from "../entities/Instance";

export class SaveInstanceUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository, private encryptionKey: string) {}

    public async execute(instance: Instance): Promise<ValidationError[]> {
        const validations = instance.validate();

        if (validations.length === 0) {
            await this.storageRepository.saveObjectInCollection(
                Namespace.INSTANCES,
                instance.encryptPassword(this.encryptionKey).toObject(),
                ["metadataMapping"]
            );
        }

        return validations;
    }
}
