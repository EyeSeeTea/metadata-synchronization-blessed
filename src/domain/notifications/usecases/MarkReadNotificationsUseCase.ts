import { Namespace } from "../../../data/storage/Namespaces";
import { promiseMap } from "../../../utils/common";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { AppNotification } from "../entities/Notification";

export class MarkReadNotificationsUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(ids: string[], read: boolean): Promise<void> {
        const notifications = await this.storageRepository(
            this.localInstance
        ).listObjectsInCollection<AppNotification>(Namespace.NOTIFICATIONS);
        if (!notifications) return;

        const targetNotifications = notifications.filter(({ id }) => ids.includes(id));

        await promiseMap(targetNotifications, async notification => {
            const hasPermissions = await this.hasPermissions(notification);
            if (!hasPermissions) return;

            await this.storageRepository(this.localInstance).saveObjectInCollection(
                Namespace.NOTIFICATIONS,
                {
                    ...notification,
                    read,
                }
            );
        });
    }

    private async hasPermissions(notification: AppNotification) {
        const { id, userGroups } = await this.instanceRepository(this.localInstance).getUser();

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
