import { Namespace } from "../../../data/storage/Namespaces";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { AppNotification } from "../entities/Notification";

export class MarkReadNotificationsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(ids: string[], read: boolean): Promise<void> {
        const storageClient = await this.repositoryFactory.configRepository(this.localInstance).getStorageClient();

        const notifications = await storageClient.listObjectsInCollection<AppNotification>(Namespace.NOTIFICATIONS);
        if (!notifications) return;

        const targetNotifications = notifications.filter(({ id }) => ids.includes(id));

        await promiseMap(targetNotifications, async notification => {
            const hasPermissions = await this.hasPermissions(notification);
            if (!hasPermissions) return;

            await storageClient.saveObjectInCollection(Namespace.NOTIFICATIONS, {
                ...notification,
                read,
            });
        });
    }

    private async hasPermissions(notification: AppNotification) {
        const { id, userGroups } = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();

        if (
            notification.owner.id !== id &&
            !notification.users?.find(user => user.id === id) &&
            !notification.userGroups?.find(({ id }) => userGroups.map(({ id }) => id).includes(id))
        ) {
            return false;
        }

        return true;
    }
}
