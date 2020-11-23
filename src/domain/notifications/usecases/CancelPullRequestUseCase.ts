import { cache } from "../../../utils/cache";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { AppNotification } from "../entities/Notification";
import {
    SentPullRequestNotification,
    ReceivedPullRequestNotification,
} from "../entities/PullRequestNotification";

export type CancelPullRequestError =
    | "NOT_FOUND"
    | "INSTANCE_NOT_FOUND"
    | "INVALID"
    | "REMOTE_NOT_FOUND"
    | "REMOTE_INVALID";

export class CancelPullRequestUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(id: string): Promise<Either<CancelPullRequestError, void>> {
        const notification = await this.getNotification(this.localInstance, id);

        if (!notification) {
            return Either.error("NOT_FOUND");
        } else if (notification.type !== "sent-pull-request") {
            return Either.error("INVALID");
        }

        const newNotification: SentPullRequestNotification = {
            ...notification,
            read: true,
            status: "CANCELLED",
        };

        await this.storageRepository(this.localInstance).saveObjectInCollection(
            Namespace.NOTIFICATIONS,
            newNotification
        );

        const remoteInstance = await this.getInstanceById(notification.instance.id);
        if (!remoteInstance) return Either.error("INSTANCE_NOT_FOUND");

        const remoteNotification = await this.getNotification(
            remoteInstance,
            notification.remoteNotification
        );

        if (!remoteNotification) {
            return Either.error("REMOTE_NOT_FOUND");
        } else if (remoteNotification.type !== "received-pull-request") {
            return Either.error("REMOTE_INVALID");
        }

        const newRemoteNotification: ReceivedPullRequestNotification = {
            ...remoteNotification,
            read: false,
            status: "CANCELLED",
            payload: {},
        };

        await this.storageRepository(remoteInstance).saveObjectInCollection(
            Namespace.NOTIFICATIONS,
            newRemoteNotification
        );

        return Either.success(undefined);
    }

    @cache()
    private storageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
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

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        const objects = await this.storageRepository(this.localInstance).listObjectsInCollection<
            InstanceData
        >(Namespace.INSTANCES);

        const data = objects.find(data => data.id === id);
        if (!data) return undefined;

        return Instance.build(data).decryptPassword(this.encryptionKey);
    }
}
