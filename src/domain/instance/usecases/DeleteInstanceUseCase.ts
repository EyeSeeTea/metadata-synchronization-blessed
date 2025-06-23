import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../entities/Instance";

export class DeleteInstanceUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<boolean> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

        try {
            await storageClient.removeObjectInCollection(Namespace.INSTANCES, id);
        } catch (error: any) {
            console.error(error);
            return false;
        }

        return true;
    }
}
