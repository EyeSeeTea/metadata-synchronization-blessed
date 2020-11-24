import { Namespace } from "../../../data/storage/Namespaces";
import { promiseMap } from "../../../utils/common";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage, Package } from "../../packages/entities/Package";

export class DeleteModuleUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(id: string, instance = this.localInstance): Promise<boolean> {
        try {
            await this.storageRepository(instance).removeObjectInCollection(Namespace.MODULES, id);
            await this.deletePackagesFromModule(id, instance);
        } catch (error) {
            return false;
        }

        return true;
    }

    private async deletePackagesFromModule(id: string, instance: Instance): Promise<void> {
        const packages = await this.storageRepository(instance).listObjectsInCollection<Package>(
            Namespace.PACKAGES
        );

        const newPackages = packages
            .filter(({ module }) => module.id === id)
            .map(({ module, ...rest }) => ({
                ...rest,
                module: { ...module, name: `${module.name} [Deleted]` },
            }));

        await promiseMap(newPackages, async (item: BasePackage) => {
            await this.storageRepository(instance).saveObjectInCollection(Namespace.PACKAGES, item);
        });
    }
}
