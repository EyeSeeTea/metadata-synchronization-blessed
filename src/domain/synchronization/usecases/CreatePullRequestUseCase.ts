import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { NamedRef } from "../../common/entities/Ref";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
import { MessageNotification } from "../../notifications/entities/Notification";
import {
    ReceivedPullRequestNotification,
    SentPullRequestNotification,
} from "../../notifications/entities/PullRequestNotification";
import { SynchronizationType } from "../entities/SynchronizationType";

interface CreatePullRequestParams {
    instance: Instance;
    type: SynchronizationType;
    ids: string[];
    payload: MetadataPackage;
    subject: string;
    description?: string;
    notificationUsers: Pick<MessageNotification, "users" | "userGroups">;
}

export class CreatePullRequestUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute({
        instance,
        type,
        ids,
        payload,
        subject,
        description = "",
        notificationUsers: { users, userGroups },
    }: CreatePullRequestParams): Promise<void> {
        const owner = await this.getOwner();

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

        await this.storageRepository(instance).saveObjectInCollection(
            Namespace.NOTIFICATIONS,
            receivedPullRequest
        );

        await this.storageRepository(this.localInstance).saveObjectInCollection(
            Namespace.NOTIFICATIONS,
            sentPullRequest
        );

        await this.sendMessage(instance, receivedPullRequest);
    }

    private async getOwner(): Promise<NamedRef> {
        const { id, name } = await this.instanceRepository(this.localInstance).getUser();
        return { id, name };
    }

    private async sendMessage(
        instance: Instance,
        {
            id,
            subject,
            text,
            owner,
            instance: origin,
            users,
            userGroups,
            selectedIds,
        }: ReceivedPullRequestNotification
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

        await this.instanceRepository(instance).sendMessage({
            subject: `[MDSync] Received Pull Request: ${subject}`,
            text: message.join("\n\n"),
            users: users.map(({ id }) => ({ id })),
            userGroups: userGroups.map(({ id }) => ({ id })),
        });
    }

    private async getResponsibleNames(instance: Instance, ids: string[]) {
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

        return [...users, ...userGroups].map(({ name }) => name);
    }
}
