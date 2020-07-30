import _ from "lodash";
import { NamedRef, Ref } from "../../common/entities/Ref";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
import {
    PullRequestNotification,
    ReceivedPullRequestNotification,
    SentPullRequestNotification,
} from "../../notifications/entities/PullRequestNotification";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { SynchronizationType } from "../entities/SynchronizationType";

interface NotificationUsers {
    users: Ref[];
    userGroups: Ref[];
}

interface CreatePullRequestParams {
    instance: Instance;
    type: SynchronizationType;
    ids: string[];
    payload: MetadataPackage;
    subject: string;
    description?: string;
    notificationUsers: NotificationUsers;
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
        notificationUsers,
    }: CreatePullRequestParams): Promise<void> {
        const owner = await this.getOwner();
        const { users, userGroups } = await this.getResponsibles(instance, ids);

        const receivedPullRequest = ReceivedPullRequestNotification.create({
            subject,
            text: description,
            owner,
            users,
            userGroups,
            instance: this.localInstance.toPublicObject(),
            syncType: type,
            selectedIds: ids,
            payload,
        });

        const sentPullRequest = SentPullRequestNotification.create({
            subject,
            text: description,
            owner,
            users,
            userGroups,
            instance: instance.toPublicObject(),
            syncType: type,
            selectedIds: ids,
            remoteNotification: receivedPullRequest.id,
        });

        await this.saveNotification(instance, receivedPullRequest);
        await this.saveNotification(this.localInstance, sentPullRequest);

        await this.sendMessage(instance, receivedPullRequest, notificationUsers);
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

    private async sendMessage(
        instance: Instance,
        {
            subject,
            text,
            owner,
            instance: origin,
            users: responsibleUsers,
            userGroups: responsibleUserGroups,
        }: PullRequestNotification,
        { users, userGroups }: NotificationUsers
    ): Promise<void> {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );

        const responsibles = [...responsibleUsers, ...responsibleUserGroups].map(
            ({ name }) => name
        );

        const message = [
            `Origin instance: ${origin.url}`,
            `User: ${owner.name}`,
            `Responsibles: ${responsibles.join(", ")}`,
            text,
        ];

        await instanceRepository.sendMessage({
            subject: `[MDSync] Received Pull Request: ${subject}`,
            text: message.join("\n\n"),
            users: users.map(({ id }) => ({ id })),
            userGroups: userGroups.map(({ id }) => ({ id })),
        });
    }
}
