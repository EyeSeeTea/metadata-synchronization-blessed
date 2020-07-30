import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { Instance, InstanceData } from "../entities/Instance";

export class GetInstanceByIdUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(id: string): Promise<Instance | undefined> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const objects = await storageRepository.listObjectsInCollection<InstanceData>(
            Namespace.INSTANCES
        );

        const data = objects.find(data => data.id === id);
        if (!data) return undefined;

        return Instance.build(data).decryptPassword(this.encryptionKey);
    }
}
