import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";

export class DeleteNotificationsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(ids: string[]): Promise<void> {
        await promiseMap(ids, id =>
            this.storageRepository(this.localInstance).removeObjectInCollection(
                Namespace.NOTIFICATIONS,
                id
            )
        );
    }

    private storageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
    }
}
