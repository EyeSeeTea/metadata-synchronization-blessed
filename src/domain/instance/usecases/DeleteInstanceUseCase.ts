import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../../data/storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { Instance } from "../entities/Instance";

export class DeleteInstanceUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<boolean> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        try {
            await storageRepository.removeObjectInCollection(Namespace.INSTANCES, id);
        } catch (error) {
            console.error(error);
            return false;
        }

        return true;
    }
}
