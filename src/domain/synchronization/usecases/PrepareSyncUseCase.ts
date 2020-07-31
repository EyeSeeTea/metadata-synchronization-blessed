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

type SyncError = "PULL_REQUEST";

export class PrepareSyncUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(
        type: SynchronizationType,
        { originInstance, metadataIds }: SynchronizationBuilder
    ): Promise<Either<SyncError, void>> {
        if (originInstance === "LOCAL" || type !== "metadata") return Either.success(undefined);

        const responsibles = await this.getResponsiblesForInstance(originInstance);
        const protectedItems = responsibles.map(({ id }) => id);
        const areProtectedItemsIncluded = _.intersection(metadataIds, protectedItems).length > 0;
        if (areProtectedItemsIncluded) return Either.error("PULL_REQUEST");

        return Either.success(undefined);
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
