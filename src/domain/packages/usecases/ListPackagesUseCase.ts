import { cache } from "../../../utils/cache";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataModule } from "../../modules/entities/MetadataModule";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../../data/storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { BasePackage, Package } from "../entities/Package";

export class ListPackagesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        bypassSharingSettings = false,
        instance = this.localInstance
    ): Promise<Package[]> {
        const userGroups = await this.instanceRepository(this.localInstance).getUserGroups();
        const { id: userId } = await this.instanceRepository(this.localInstance).getUser();

        const items = await this.storageRepository(instance).listObjectsInCollection<BasePackage>(
            Namespace.PACKAGES
        );

        return items
            .filter(({ deleted }) => !deleted)
            .map(data => Package.build(data))
            .filter(
                ({ module }) =>
                    bypassSharingSettings ||
                    MetadataModule.build(module).hasPermissions("read", userId, userGroups)
            );
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
}
