import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import {
    MetadataRepository,
    MetadataRepositoryConstructor,
} from "../../metadata/repositories/MetadataRepository";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { TransformationRepositoryConstructor } from "../../transformations/repositories/TransformationRepository";
import { AppNotification } from "../entities/Notification";
import { PullRequestStatus } from "../entities/PullRequestNotification";

export type ImportPullRequestError =
    | "INSTANCE_NOT_FOUND"
    | "NOTIFICATION_NOT_FOUND"
    | "INVALID_NOTIFICATION"
    | "REMOTE_NOTIFICATION_NOT_FOUND"
    | "REMOTE_INVALID_NOTIFICATION"
    | "ALREADY_IMPORTED"
    | "NOT_APPROVED";

export class ImportPullRequestUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(
        notificationId: string
    ): Promise<Either<ImportPullRequestError, SynchronizationResult>> {
        const notification = await this.getNotification(this.localInstance, notificationId);
        if (!notification) return Either.error("NOTIFICATION_NOT_FOUND");
        if (notification.type !== "sent-pull-request") return Either.error("INVALID_NOTIFICATION");

        const remoteInstance = await this.getInstanceById(notification.instance.id);
        if (!remoteInstance) return Either.error("INSTANCE_NOT_FOUND");

        const remoteNotification = await this.getNotification(
            remoteInstance,
            notification.remoteNotification
        );

        if (!remoteNotification) return Either.error("REMOTE_NOTIFICATION_NOT_FOUND");
        if (remoteNotification.type !== "received-pull-request")
            return Either.error("REMOTE_INVALID_NOTIFICATION");
        if (remoteNotification.status === "IMPORTED") return Either.error("ALREADY_IMPORTED");
        if (remoteNotification.status === "PENDING" || remoteNotification.status === "REJECTED")
            return Either.error("NOT_APPROVED");

        const result = await this.metadataRepository(this.localInstance).save(
            remoteNotification.payload
        );

        const status: PullRequestStatus =
            result.status === "SUCCESS" ? "IMPORTED" : "IMPORTED_WITH_ERRORS";

        const payload = status === "IMPORTED" ? {} : remoteNotification.payload;

        await this.storageRepository(
            this.localInstance
        ).saveObjectInCollection(Namespace.NOTIFICATIONS, { ...notification, read: true, status });

        await this.storageRepository(remoteInstance).saveObjectInCollection(
            Namespace.NOTIFICATIONS,
            { ...remoteNotification, read: false, status, payload },
            ["payload"]
        );

        return Either.success(result);
    }

    private storageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
    }

    private metadataRepository(instance: Instance): MetadataRepository {
        const transformationRepository = this.repositoryFactory.get<
            TransformationRepositoryConstructor
        >(Repositories.TransformationRepository, []);

        return this.repositoryFactory.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [instance, transformationRepository]
        );
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        const objects = await this.storageRepository(this.localInstance).listObjectsInCollection<
            InstanceData
        >(Namespace.INSTANCES);

        const data = objects.find(data => data.id === id);
        if (!data) return undefined;

        return Instance.build(data).decryptPassword(this.encryptionKey);
    }

    private async getNotification(
        instance: Instance,
        id: string
    ): Promise<AppNotification | undefined> {
        return await this.storageRepository(instance).getObjectInCollection<AppNotification>(
            Namespace.NOTIFICATIONS,
            id
        );
    }
}
