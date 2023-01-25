import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataModule } from "../../modules/entities/MetadataModule";
import { BaseModule } from "../../modules/entities/Module";
import { BasePackage, Package } from "../entities/Package";

export class ListPackagesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(bypassSharingSettings = false, instance = this.localInstance): Promise<Package[]> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClient();

        const { userGroups } = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();
        const { id: userId } = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();

        const items = await storageClient.listObjectsInCollection<BasePackage>(Namespace.PACKAGES);
        const modulesSource = (await storageClient.listObjectsInCollection<BaseModule>(Namespace.MODULES)).map(module =>
            MetadataModule.build(module)
        );

        const isRemoteInstance = instance !== this.localInstance;

        const result = items
            .filter(({ deleted }) => !deleted)
            .map(data => Package.build(data))
            .filter(({ module }) => {
                const moduleSource = modulesSource.find(source => source.id === module.id);

                return (
                    bypassSharingSettings ||
                    isRemoteInstance ||
                    moduleSource?.hasPermissions("read", userId, userGroups)
                );
            });

        return result;
    }
}
