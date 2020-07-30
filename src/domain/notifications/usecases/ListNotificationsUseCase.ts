import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { AppNotification } from "../entities/Notification";

export class ListNotificationsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance): Promise<AppNotification[]> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );

        const items = await storageRepository.listObjectsInCollection<AppNotification>(
            Namespace.NOTIFICATIONS
        );

        const { id, userGroups } = await instanceRepository.getUser();

        return items.filter(
            notification =>
                notification.owner.id === id ||
                notification.users?.find(user => user.id === id) ||
                notification.userGroups?.find(({ id }) => userGroups.includes(id))
        );
    }
}
