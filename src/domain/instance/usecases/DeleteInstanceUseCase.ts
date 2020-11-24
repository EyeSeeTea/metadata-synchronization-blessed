import { Namespace } from "../../../data/storage/Namespaces";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class DeleteInstanceUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(id: string): Promise<boolean> {
        try {
            await this.storageRepository(this.localInstance).removeObjectInCollection(
                Namespace.INSTANCES,
                id
            );
        } catch (error) {
            console.error(error);
            return false;
        }

        return true;
    }
}
