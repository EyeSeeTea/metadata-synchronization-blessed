import { Namespace } from "../../../data/storage/Namespaces";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataModule } from "../../modules/entities/MetadataModule";
import { BasePackage, Package } from "../entities/Package";

export class ListPackagesUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

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
}
