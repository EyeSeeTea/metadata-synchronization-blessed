import _ from "lodash";
import { NamedRef } from "../../common/entities/Ref";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
import {
    PullRequestNotification,
    SentPullRequestNotification,
} from "../../notifications/entities/PullRequestNotification";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { PullRequest, PullRequestType } from "../entities/PullRequest";

interface CreatePullRequestParams {
    instance: Instance;
    type: PullRequestType;
    ids: string[];
    payload: MetadataPackage;
    subject: string;
    description?: string;
}

export class CreatePullRequestUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute({
        instance,
        type,
        ids,
        payload,
        subject,
        description = "",
    }: CreatePullRequestParams): Promise<void> {
        const owner = await this.getOwner();
        const { users, userGroups } = await this.getResponsibles(instance, ids);

        const notification = SentPullRequestNotification.create({
            subject,
            text: description,
            owner,
            request: {
                type,
                status: "PENDING",
                selectedIds: ids,
            },
            users,
            userGroups,
        });

        await this.saveNotification(instance, notification);

        const pullRequest = PullRequest.create({
            instance: instance.id,
            type: "metadata",
            payload,
            notification: notification.id,
        });

        await this.savePullRequest(pullRequest);
    }

    private async getOwner(): Promise<NamedRef> {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const { id, name } = await instanceRepository.getUser();
        return { id, name };
    }

    private async getResponsibles(instance: Instance, ids: string[]) {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const responsibles = await storageRepository.listObjectsInCollection<MetadataResponsible>(
            Namespace.RESPONSIBLES
        );

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

    private async saveNotification(
        instance: Instance,
        notification: PullRequestNotification
    ): Promise<void> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        await storageRepository.saveObjectInCollection(Namespace.NOTIFICATIONS, notification);
    }

    private async savePullRequest(pullRequest: PullRequest) {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        await storageRepository.saveObjectInCollection(Namespace.PULL_REQUEST, pullRequest);
    }
}
