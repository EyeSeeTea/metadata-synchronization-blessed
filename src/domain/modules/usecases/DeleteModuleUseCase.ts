import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { BasePackage, Package } from "../../packages/entities/Package";

export class DeleteModuleUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<boolean> {
        try {
            await this.storageRepository.removeObjectInCollection(Namespace.MODULES, id);
            await this.deletePackagesFromModule(id);
        } catch (error) {
            return false;
        }

        return true;
    }

    private async deletePackagesFromModule(id: string): Promise<void> {
        const packages = await this.storageRepository.listObjectsInCollection<Package>(
            Namespace.PACKAGES
        );

        const newPackages = packages
            .filter(({ module }) => module.id === id)
            .map(({ module, ...rest }) => ({
                ...rest,
                module: { ...module, name: `${module.name} [Deleted]` },
            }));

        await promiseMap(newPackages, async (item: BasePackage) => {
            await this.storageRepository.saveObjectInCollection(
                Namespace.PACKAGES,
                item,
                Package.extendedFields
            );
        });
    }
}
