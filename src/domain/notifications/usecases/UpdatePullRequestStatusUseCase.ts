import _ from "lodash";
import { cache } from "../../../utils/cache";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
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
        const notification = await this.storageRepository(this.localInstance).getObjectInCollection<
            ReceivedPullRequestNotification
        >(Namespace.NOTIFICATIONS, id);

        if (!notification) {
            return Either.error("NOT_FOUND");
        } else if (notification.type !== "received-pull-request") {
            return Either.error("INVALID");
        }

        const hasPermissions = await this.hasPermissions(notification.selectedIds);
        if (!hasPermissions) return Either.error("PERMISSIONS");

        const newNotification: ReceivedPullRequestNotification = {
            ...notification,
            read: true,
            status,
        };

        await this.storageRepository(this.localInstance).saveObjectInCollection(
            Namespace.NOTIFICATIONS,
            newNotification
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

    @cache()
    private instanceRepository(instance: Instance) {
        return this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );
    }

    private async hasPermissions(ids: string[]) {
        const responsibles = await this.getResponsibles(this.localInstance, ids);
        const { id, userGroups } = await this.instanceRepository(this.localInstance).getUser();

        if (
            !responsibles.users?.find(user => user.id === id) &&
            !responsibles.userGroups?.find(({ id }) => userGroups.includes(id))
        ) {
            return false;
        }

        return true;
    }

    private async getResponsibles(instance: Instance, ids: string[]) {
        const responsibles = await this.storageRepository(instance).listObjectsInCollection<
            MetadataResponsible
        >(Namespace.RESPONSIBLES);

        const metadataResponsibles = responsibles.filter(({ id }) => ids.includes(id));

        const users = _.uniqBy(
            metadataResponsibles.flatMap(({ users }) => users),
            "id"
        );

        const userGroups = _.uniqBy(
            metadataResponsibles.flatMap(({ userGroups }) => userGroups),
            "id"
        );

        return { users, userGroups };
    }
}
