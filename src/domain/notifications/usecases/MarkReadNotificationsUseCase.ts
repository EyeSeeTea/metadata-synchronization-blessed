import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { AppNotification } from "../entities/Notification";

export class MarkReadNotificationsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(ids: string[], read: boolean): Promise<void> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        await promiseMap(ids, async id => {
            const notification = await storageRepository.getObjectInCollection<AppNotification>(
                Namespace.NOTIFICATIONS,
                id
            );
            if (!notification) return;

            const hasPermissions = await this.hasPermissions(notification);
            if (!hasPermissions) return;

            const newNotification = { ...notification, read };
            await storageRepository.saveObjectInCollection(
                Namespace.NOTIFICATIONS,
                newNotification
            );
        });
    }

    private async hasPermissions(notification: AppNotification) {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const { id, userGroups } = await instanceRepository.getUser();

        if (
            !notification.users?.find(user => user.id === id) &&
            !notification.userGroups?.find(({ id }) => userGroups.includes(id))
        ) {
            return false;
        }

        return true;
    }
}
