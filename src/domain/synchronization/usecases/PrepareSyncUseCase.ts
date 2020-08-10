import _ from "lodash";
import { SynchronizationBuilder } from "../../../types/synchronization";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { SynchronizationType } from "../entities/SynchronizationType";

export type PrepareSyncError = "PULL_REQUEST" | "PULL_REQUEST_RESPONSIBLE";

export class PrepareSyncUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(
        type: SynchronizationType,
        { originInstance, metadataIds }: SynchronizationBuilder
    ): Promise<Either<PrepareSyncError, void>> {
        // If sync is not a metadata pull, allow sync
        if (originInstance === "LOCAL" || type !== "metadata") return Either.success(undefined);

        const responsibles = await this.getResponsiblesForInstance(originInstance);
        const protectedItems = _.intersectionWith(
            responsibles,
            metadataIds,
            ({ id }, metadataId) => id === metadataId
        );

        // If there're no protected items continue sync
        if (protectedItems.length === 0) {
            return Either.success(undefined);
        }

        // If current user is one of the responsibles, block sync but allow bypassing
        const currentUser = await this.getCurrentUser();

        if (
            _.every(protectedItems, ({ users, userGroups }) => {
                const sameUser = users.map(({ id }) => id).includes(currentUser.id);
                const sameGroup =
                    _.intersection(
                        userGroups.map(({ id }) => id),
                        currentUser.userGroups
                    ).length > 0;

                return sameUser || sameGroup;
            })
        ) {
            return Either.error("PULL_REQUEST_RESPONSIBLE");
        }

        // If at least one of the items is protected, block sync
        return Either.error("PULL_REQUEST");
    }

    private async getCurrentUser() {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        return instanceRepository.getUser();
    }

    private async getResponsiblesForInstance(instanceId: string) {
        const instance = await this.getInstanceById(instanceId);
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const responsibles = await storageRepository.listObjectsInCollection<MetadataResponsible>(
            Namespace.RESPONSIBLES
        );

        return responsibles;
    }

    private async getInstanceById(id: string): Promise<Instance> {
        if (id === "LOCAL") return this.localInstance;

        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const objects = await storageRepository.listObjectsInCollection<InstanceData>(
            Namespace.INSTANCES
        );

        const data = objects.find(data => data.id === id);
        if (!data) throw new Error("Instance not found");

        const instance = Instance.build(data).decryptPassword(this.encryptionKey);
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );

        const version = await instanceRepository.getVersion();
        return instance.update({ version });
    }
}
