import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { AppNotification } from "../entities/Notification";
import { PullRequestStatus, ReceivedPullRequestNotification } from "../entities/PullRequestNotification";

export type ImportPullRequestError =
    | "INSTANCE_NOT_FOUND"
    | "NOTIFICATION_NOT_FOUND"
    | "INVALID_NOTIFICATION"
    | "REMOTE_NOTIFICATION_NOT_FOUND"
    | "REMOTE_INVALID_NOTIFICATION"
    | "ALREADY_IMPORTED"
    | "NOT_APPROVED";

export class ImportPullRequestUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(notificationId: string): Promise<Either<ImportPullRequestError, SynchronizationResult>> {
        const localStorageClient = await this.repositoryFactory.configRepository(this.localInstance).getStorageClient();

        const notification = await this.getNotification(this.localInstance, notificationId);
        if (!notification) return Either.error("NOTIFICATION_NOT_FOUND");
        if (notification.type !== "sent-pull-request") return Either.error("INVALID_NOTIFICATION");

        const remoteInstance = await this.getInstanceById(notification.instance.id);
        if (!remoteInstance) return Either.error("INSTANCE_NOT_FOUND");

        const remoteStorageClient = await this.repositoryFactory.configRepository(remoteInstance).getStorageClient();

        const remoteNotification = await this.getNotification(remoteInstance, notification.remoteNotification);

        if (!remoteNotification) return Either.error("REMOTE_NOTIFICATION_NOT_FOUND");
        if (remoteNotification.type !== "received-pull-request") return Either.error("REMOTE_INVALID_NOTIFICATION");
        if (remoteNotification.status === "IMPORTED") return Either.error("ALREADY_IMPORTED");
        if (remoteNotification.status === "PENDING" || remoteNotification.status === "REJECTED")
            return Either.error("NOT_APPROVED");

        const result = await this.repositoryFactory
            .metadataRepository(this.localInstance)
            .save(remoteNotification.payload);

        const status: PullRequestStatus = result.status === "SUCCESS" ? "IMPORTED" : "IMPORTED_WITH_ERRORS";

        const payload = status === "IMPORTED" ? {} : remoteNotification.payload;

        await localStorageClient.saveObjectInCollection(Namespace.NOTIFICATIONS, {
            ...notification,
            read: true,
            status,
        });

        await remoteStorageClient.saveObjectInCollection(Namespace.NOTIFICATIONS, {
            ...remoteNotification,
            read: false,
            status,
            payload,
        });

        await this.sendMessage(
            remoteInstance,
            remoteNotification,
            status === "IMPORTED" ? "Pull request imported" : "Pull request could not be imported"
        );

        return Either.success({ ...result, origin: remoteInstance.toPublicObject() });
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        return this.repositoryFactory.instanceRepository(this.localInstance).getById(id);
    }

    private async getNotification(instance: Instance, id: string): Promise<AppNotification | undefined> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClient();

        return await storageClient.getObjectInCollection<AppNotification>(Namespace.NOTIFICATIONS, id);
    }

    private async sendMessage(
        instance: Instance,
        { id, subject, text, owner, instance: origin, users, userGroups, selectedIds }: ReceivedPullRequestNotification,
        title: string
    ): Promise<void> {
        const recipients = [...users, ...userGroups].map(({ name }) => name);
        const responsibles = await this.getResponsibleNames(instance, selectedIds);

        const message = [
            `Origin instance: ${origin.url}`,
            `Created by: ${owner.name}`,
            `Recipients: ${recipients.join(", ")} `,
            `Responsibles: ${responsibles.join(", ")}`,
            text,
            `More details at: ${instance.url}/api/apps/MetaData-Synchronization/index.html#/notifications/${id}`,
        ];

        await this.repositoryFactory.instanceRepository(instance).sendMessage({
            subject: `[MDSync] ${title}: ${subject}`,
            text: message.join("\n\n"),
            users: users.map(({ id }) => ({ id })),
            userGroups: userGroups.map(({ id }) => ({ id })),
        });
    }

    private async getResponsibleNames(instance: Instance, ids: string[]) {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClient();

        const responsibles = await storageClient.listObjectsInCollection<MetadataResponsible>(Namespace.RESPONSIBLES);

        const metadataResponsibles = responsibles.filter(({ id }) => ids.includes(id));

        const users = _.uniqBy(
            metadataResponsibles.flatMap(({ users }) => users),
            "id"
        );

        const userGroups = _.uniqBy(
            metadataResponsibles.flatMap(({ userGroups }) => userGroups),
            "id"
        );

        return [...users, ...userGroups].map(({ name }) => name);
    }
}
