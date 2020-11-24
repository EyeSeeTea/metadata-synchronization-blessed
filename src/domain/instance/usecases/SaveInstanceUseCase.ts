import { Namespace } from "../../../data/storage/Namespaces";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class SaveInstanceUseCase extends DefaultUseCase implements UseCase {
    constructor(
        repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {
        super(repositoryFactory);
    }

    public async execute(instance: Instance): Promise<ValidationError[]> {
        const validations = instance.validate();

        if (validations.length === 0) {
            await this.storageRepository(this.localInstance).saveObjectInCollection(
                Namespace.INSTANCES,
                instance.encryptPassword(this.encryptionKey).toObject()
            );
        }

        return validations;
    }
}
