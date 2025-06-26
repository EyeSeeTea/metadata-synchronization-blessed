import { Namespace } from "../../../data/storage/Namespaces";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage, Package } from "../../packages/entities/Package";

export class DeleteModuleUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<boolean> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

        try {
            await storageClient.removeObjectInCollection(Namespace.MODULES, id);
            await this.deletePackagesFromModule(id, instance);
        } catch (error: any) {
            return false;
        }

        return true;
    }

    private async deletePackagesFromModule(id: string, instance: Instance): Promise<void> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

        const packages = await storageClient.listObjectsInCollection<Package>(Namespace.PACKAGES);

        const newPackages = packages
            .filter(({ module }) => module.id === id)
            .map(({ module, ...rest }) => ({
                ...rest,
                module: { ...module, name: `${module.name} [Deleted]` },
            }));

        await promiseMap(newPackages, async (item: BasePackage) => {
            await storageClient.saveObjectInCollection(Namespace.PACKAGES, item);
        });
    }
}
