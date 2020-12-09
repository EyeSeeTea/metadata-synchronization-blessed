import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import { AppNotification } from "../entities/Notification";

export class ListNotificationsUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(): Promise<AppNotification[]> {
        const { id, userGroups } = await this.repositoryFactory
            .instanceRepository(this.localInstance)
            .getUser();
        const notifications = await this.getInstanceNotifications();

        const sentPullRequestNotifications = notifications.filter(
            ({ type }) => type === "sent-pull-request"
        );

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
                    notification.userGroups?.find(({ id }) => userGroups.includes(id))
            );
    }

    private async getInstanceNotifications(): Promise<AppNotification[]> {
        return this.repositoryFactory
            .storageRepository(this.localInstance)
            .listObjectsInCollection<AppNotification>(Namespace.NOTIFICATIONS);
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        const objects = await this.repositoryFactory
            .storageRepository(this.localInstance)
            .listObjectsInCollection<InstanceData>(Namespace.INSTANCES);

        const data = objects.find(data => data.id === id);
        if (!data) return undefined;

        return Instance.build({
            ...data,
            url: data.type === "local" ? this.localInstance.url : data.url,
            version: data.type === "local" ? this.localInstance.version : data.version,
        }).decryptPassword(this.encryptionKey);
    }

    private async updateSentPullRequest(
        notification: AppNotification
    ): Promise<AppNotification | undefined> {
        if (notification.type !== "sent-pull-request" || notification.status !== "PENDING")
            return undefined;

        const instance = await this.getInstanceById(notification.instance.id);
        if (!instance) return undefined;

        const remoteNotification = await this.repositoryFactory
            .storageRepository(instance)
            .getObjectInCollection<AppNotification>(
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

        await this.repositoryFactory
            .storageRepository(this.localInstance)
            .saveObjectInCollection(Namespace.NOTIFICATIONS, newNotification);

        return newNotification;
    }
}
