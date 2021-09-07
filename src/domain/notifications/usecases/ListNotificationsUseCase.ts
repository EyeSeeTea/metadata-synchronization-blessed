import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { AppNotification } from "../entities/Notification";

export class ListNotificationsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<AppNotification[]> {
        const { id, userGroups } = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();
        const notifications = await this.getInstanceNotifications();

        const sentPullRequestNotifications = notifications.filter(({ type }) => type === "sent-pull-request");

        const updatedNotifications = await promiseMap(sentPullRequestNotifications, notification =>
            this.updateSentPullRequest(notification).catch(err => {
                console.error(err);
                return undefined;
            })
        );

        return _([...updatedNotifications, ...notifications])
            .compact()
            .uniqBy("id")
            .value()
            .filter(
                notification =>
                    notification.owner.id === id ||
                    notification.users?.find(user => user.id === id) ||
                    notification.userGroups?.find(({ id }) => userGroups.map(({ id }) => id).includes(id))
            );
    }

    private async getInstanceNotifications(): Promise<AppNotification[]> {
        const storageClient = await this.repositoryFactory.configRepository(this.localInstance).getStorageClient();

        return storageClient.listObjectsInCollection<AppNotification>(Namespace.NOTIFICATIONS);
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        return this.repositoryFactory.instanceRepository(this.localInstance).getById(id);
    }

    private async updateSentPullRequest(notification: AppNotification): Promise<AppNotification | undefined> {
        const localStorageClient = await this.repositoryFactory.configRepository(this.localInstance).getStorageClient();

        if (notification.type !== "sent-pull-request" || notification.status !== "PENDING") return undefined;

        const remoteInstance = await this.getInstanceById(notification.instance.id);
        if (!remoteInstance) return undefined;

        const remoteStorageClient = await this.repositoryFactory.configRepository(remoteInstance).getStorageClient();

        const remoteNotification = await remoteStorageClient.getObjectInCollection<AppNotification>(
            Namespace.NOTIFICATIONS,
            notification.remoteNotification
        );

        if (
            !remoteNotification ||
            remoteNotification.type !== "received-pull-request" ||
            remoteNotification.status === "PENDING"
        ) {
            return undefined;
        }

        const newNotification = {
            ...notification,
            read: false,
            status: remoteNotification.status,
        };

        await localStorageClient.saveObjectInCollection(Namespace.NOTIFICATIONS, newNotification);

        return newNotification;
    }
}
