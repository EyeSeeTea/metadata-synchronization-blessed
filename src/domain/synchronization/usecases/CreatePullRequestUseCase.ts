import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { NamedRef } from "../../common/entities/Ref";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPayloadBuilder } from "../../metadata/builders/MetadataPayloadBuilder";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
import { MessageNotification } from "../../notifications/entities/Notification";
import {
    ReceivedPullRequestNotification,
    SentPullRequestNotification,
} from "../../notifications/entities/PullRequestNotification";
import { SynchronizationBuilder } from "../entities/SynchronizationBuilder";
import { SynchronizationType } from "../entities/SynchronizationType";

interface CreatePullRequestParams {
    instance: Instance;
    type: SynchronizationType;
    ids: string[];
    syncBuilder: SynchronizationBuilder;
    subject: string;
    description?: string;
    notificationUsers: Pick<MessageNotification, "users" | "userGroups">;
}

export class CreatePullRequestUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private localInstance: Instance,
        private metadataPayloadBuilder: MetadataPayloadBuilder
    ) {}

    public async execute({
        instance,
        type,
        ids,
        syncBuilder,
        subject,
        description = "",
        notificationUsers: { users, userGroups },
    }: CreatePullRequestParams): Promise<void> {
        const payload = await this.metadataPayloadBuilder.build(syncBuilder);

        const localStorageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

        const remoteStorageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

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

        await remoteStorageClient.saveObjectInCollection(Namespace.NOTIFICATIONS, receivedPullRequest);

        await localStorageClient.saveObjectInCollection(Namespace.NOTIFICATIONS, sentPullRequest);

        await this.sendMessage(instance, receivedPullRequest);
    }

    private async getOwner(): Promise<NamedRef> {
        const { id, name } = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();
        return { id, name };
    }

    private async sendMessage(
        instance: Instance,
        { id, subject, text, owner, instance: origin, users, userGroups, selectedIds }: ReceivedPullRequestNotification
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
            subject: `[MDSync] Received Pull Request: ${subject}`,
            text: message.join("\n\n"),
            users: users.map(({ id }) => ({ id })),
            userGroups: userGroups.map(({ id }) => ({ id })),
        });
    }

    private async getResponsibleNames(instance: Instance, ids: string[]) {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

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
