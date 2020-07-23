import { NamedRef } from "../../common/entities/Ref";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
import { PullRequestNotification } from "../../notifications/entities/PullRequestNotification";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { PullRequestType } from "../entities/PullRequest";
import _ from "lodash";

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
        const responsibles = await this.getResponsibles(instance, ids);
        const users = _.uniqBy(
            responsibles.flatMap(({ userAccesses }) => userAccesses),
            "id"
        );
        const userGroups = _.uniqBy(
            responsibles.flatMap(({ userGroupAccesses }) => userGroupAccesses),
            "id"
        );

        const notification = PullRequestNotification.create({
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

        this.saveNotification(instance, notification);

        // TODO: Create pull request on local instance
        console.log("foo", notification, payload);
    }

    private async getOwner(): Promise<NamedRef> {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const { id, name } = await instanceRepository.getUser();
        return { id, name };
    }

    private async getResponsibles(
        instance: Instance,
        ids: string[]
    ): Promise<MetadataResponsible[]> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const responsibles = await storageRepository.listObjectsInCollection<MetadataResponsible>(
            Namespace.RESPONSIBLES
        );

        return responsibles.filter(({ id }) => ids.includes(id));
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
}
