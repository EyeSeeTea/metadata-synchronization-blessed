import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { promiseMap } from "../../../utils/common";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataResponsible } from "../../metadata/entities/MetadataResponsible";
import { SynchronizationBuilder } from "../entities/SynchronizationBuilder";
import { SynchronizationType } from "../entities/SynchronizationType";

export type PrepareSyncError = "PULL_REQUEST" | "PULL_REQUEST_RESPONSIBLE" | "INSTANCE_NOT_FOUND" | "NOT_AUTHORIZED";

export class PrepareSyncUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        type: SynchronizationType,
        { originInstance, metadataIds, targetInstances }: SynchronizationBuilder
    ): Promise<Either<PrepareSyncError, void>> {
        // If user does not have read permissions to all targetInstances return error
        const hasPermissions = await this.userHasPermissionsToExecute(targetInstances);
        if (!hasPermissions) return Either.error("NOT_AUTHORIZED");

        // If sync is not a metadata pull, allow sync
        if (originInstance === "LOCAL" || type !== "metadata") return Either.success(undefined);

        const responsibles = await this.getResponsiblesForInstance(originInstance);
        if (responsibles.isError() || !responsibles.value.data) {
            return Either.error("INSTANCE_NOT_FOUND");
        }

        const protectedItems = _.intersectionWith(
            responsibles.value.data,
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
                        currentUser.userGroups.map(({ id }) => id)
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
        return this.repositoryFactory.userRepository(this.localInstance).getCurrent();
    }

    private async userHasPermissionsToExecute(targetInstances: string[]): Promise<boolean> {
        const result = await promiseMap(targetInstances, id => this.getInstanceById(id));
        const instances = _.compact(result.map(either => either.value.data));
        const currentUser = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();

        return _.every(instances, instance => instance.hasPermissions("read", currentUser));
    }

    private async getResponsiblesForInstance(
        instanceId: string
    ): Promise<Either<"INSTANCE_NOT_FOUND", MetadataResponsible[]>> {
        const instance = await this.getInstanceById(instanceId);
        if (instance.isError() || !instance.value.data) return Either.error("INSTANCE_NOT_FOUND");

        const storageClient = await this.repositoryFactory.configRepository(instance.value.data).getStorageClient();

        const responsibles = await storageClient.listObjectsInCollection<MetadataResponsible>(Namespace.RESPONSIBLES);

        return Either.success(responsibles);
    }

    private async getInstanceById(id: string): Promise<Either<"INSTANCE_NOT_FOUND", Instance>> {
        const instance = await this.repositoryFactory.instanceRepository(this.localInstance).getById(id);

        return instance ? Either.success(instance) : Either.error("INSTANCE_NOT_FOUND");
    }
}
