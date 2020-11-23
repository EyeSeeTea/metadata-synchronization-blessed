import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { AppNotification } from "../entities/Notification";

export class MarkReadNotificationsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(ids: string[], read: boolean): Promise<void> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const notifications = await storageRepository.listObjectsInCollection<AppNotification>(
            Namespace.NOTIFICATIONS
        );
        if (!notifications) return;

        const targetNotifications = notifications.filter(({ id }) => ids.includes(id));

        await promiseMap(targetNotifications, async notification => {
            const hasPermissions = await this.hasPermissions(notification);
            if (!hasPermissions) return;

            await storageRepository.saveObjectInCollection(Namespace.NOTIFICATIONS, {
                ...notification,
                read,
            });
        });
    }

    private async hasPermissions(notification: AppNotification) {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const { id, userGroups } = await instanceRepository.getUser();

        if (
            notification.owner.id !== id &&
            !notification.users?.find(user => user.id === id) &&
            !notification.userGroups?.find(({ id }) => userGroups.includes(id))
        ) {
            return false;
        }

        return true;
    }
}
