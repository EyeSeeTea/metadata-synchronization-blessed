import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class DeleteInstanceUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<boolean> {
        try {
            await this.repositoryFactory
                .storageRepository(this.localInstance)
                .removeObjectInCollection(Namespace.INSTANCES, id);
        } catch (error) {
            console.error(error);
            return false;
        }

        return true;
    }
}
