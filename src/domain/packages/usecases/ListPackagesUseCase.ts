import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataModule } from "../../modules/entities/MetadataModule";
import { BaseModule } from "../../modules/entities/Module";
import { UserRepository } from "../../user/repositories/UserRepository";
import { BasePackage, Package } from "../entities/Package";

export class ListPackagesUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private userRepository: UserRepository,
        private localInstance: Instance
    ) {}

    public async execute(bypassSharingSettings = false, instance = this.localInstance): Promise<Package[]> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

        const { userGroups } = await this.userRepository.getCurrent();
        const { id: userId } = await this.userRepository.getCurrent();

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
