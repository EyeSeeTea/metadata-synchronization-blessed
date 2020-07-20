import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage, Package } from "../../packages/entities/Package";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";

export class DeleteModuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<boolean> {
        try {
            await this.buildStorageRepository(instance).removeObjectInCollection(
                Namespace.MODULES,
                id
            );
            await this.deletePackagesFromModule(id, instance);
        } catch (error) {
            return false;
        }

        return true;
    }

    private async deletePackagesFromModule(id: string, instance: Instance): Promise<void> {
        const packages = await this.buildStorageRepository(instance).listObjectsInCollection<
            Package
        >(Namespace.PACKAGES);

        const newPackages = packages
            .filter(({ module }) => module.id === id)
            .map(({ module, ...rest }) => ({
                ...rest,
                module: { ...module, name: `${module.name} [Deleted]` },
            }));

        await promiseMap(newPackages, async (item: BasePackage) => {
            await this.buildStorageRepository(instance).saveObjectInCollection(
                Namespace.PACKAGES,
                item,
                Package.extendedFields
            );
        });
    }

    private buildStorageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
    }
}
