import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { Instance } from "../entities/Instance";

export class SaveInstanceUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(instance: Instance): Promise<ValidationError[]> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const validations = instance.validate();

        if (validations.length === 0) {
            await storageRepository.saveObjectInCollection(
                Namespace.INSTANCES,
                instance.encryptPassword(this.encryptionKey).toObject()
            );
        }

        return validations;
    }
}
