import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import {
    PullRequestStatus,
    ReceivedPullRequestNotification,
} from "../entities/PullRequestNotification";

export type UpdatePullRequestStatusError = "NOT_FOUND" | "PERMISSIONS" | "INVALID";

export class UpdatePullRequestStatusUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        id: string,
        status: PullRequestStatus
    ): Promise<Either<UpdatePullRequestStatusError, void>> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const notification = await storageRepository.getObjectInCollection<
            ReceivedPullRequestNotification
        >(Namespace.NOTIFICATIONS, id);

        if (!notification) {
            return Either.error("NOT_FOUND");
        } else if (notification.type !== "received-pull-request") {
            return Either.error("INVALID");
        }

        const hasPermissions = await this.hasPermissions(notification);
        if (!hasPermissions) return Either.error("PERMISSIONS");

        const newNotification: ReceivedPullRequestNotification = {
            ...notification,
            read: true,
            status,
        };

        await storageRepository.saveObjectInCollection(Namespace.NOTIFICATIONS, newNotification);

        return Either.success(undefined);
    }

    private async hasPermissions(notification: ReceivedPullRequestNotification) {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const { id, userGroups } = await instanceRepository.getUser();

        if (
            !notification.responsibles.users?.find(user => user.id === id) &&
            !notification.responsibles.userGroups?.find(({ id }) => userGroups.includes(id))
        ) {
            return false;
        }

        return true;
    }
}
