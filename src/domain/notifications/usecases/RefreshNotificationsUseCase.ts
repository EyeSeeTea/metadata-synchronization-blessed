import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { AppNotification } from "../entities/Notification";

export class RefreshNotificationsUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(): Promise<number> {
        const notifications = await this.getInstanceNotifications();

        const sentPullRequestNotifications = notifications.filter(
            ({ type }) => type === "sent-pull-request"
        );

        await promiseMap(sentPullRequestNotifications, notification =>
            this.updateSentPullRequest(notification)
        );

        return this.countUnreadNotifications();
    }

    private storageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
    }

    private instanceRepository() {
        return this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, this.encryptionKey]
        );
    }

    private async getInstanceNotifications(): Promise<AppNotification[]> {
        const notifications = await this.storageRepository(this.localInstance).getObject<
            AppNotification[]
        >(Namespace.NOTIFICATIONS);

        return notifications ?? [];
    }

    private async countUnreadNotifications(): Promise<number> {
        const { id, userGroups } = await this.instanceRepository().getUser();
        const notifications = await this.getInstanceNotifications();

        return notifications
            .filter(
                notification =>
                    notification.owner.id === id ||
                    notification.users?.find(user => user.id === id) ||
                    notification.userGroups?.find(({ id }) => userGroups.includes(id))
            )
            .filter(({ read }) => !read).length;
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        const objects = await this.storageRepository(this.localInstance).listObjectsInCollection<
            InstanceData
        >(Namespace.INSTANCES);

        const data = objects.find(data => data.id === id);
        if (!data) return undefined;

        return Instance.build(data).decryptPassword(this.encryptionKey);
    }

    private async updateSentPullRequest(notification: AppNotification): Promise<void> {
        if (notification.type !== "sent-pull-request" || notification.status !== "PENDING") return;

        const instance = await this.getInstanceById(notification.instance.id);
        if (!instance) return;

        const remoteNotification = await this.storageRepository(instance).getObjectInCollection<
            AppNotification
        >(Namespace.NOTIFICATIONS, notification.remoteNotification);

        if (
            remoteNotification?.type !== "received-pull-request" ||
            remoteNotification.status === "PENDING"
        ) {
            return;
        }

        this.storageRepository(this.localInstance).saveObjectInCollection(Namespace.NOTIFICATIONS, {
            ...notification,
            read: false,
            status: remoteNotification.status,
        });
    }
}
