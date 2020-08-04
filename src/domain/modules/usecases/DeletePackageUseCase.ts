import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { BasePackage, Package } from "../entities/Package";

export class DeletePackageUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<boolean> {
        try {
            const item = await this.storageRepository.getObjectInCollection<BasePackage>(
                Namespace.PACKAGES,
                id
            );

            if (!item) return false;

            await this.storageRepository.saveObjectInCollection(
                Namespace.PACKAGES,
                { ...item, deleted: true, contents: {} },
                Package.extendedFields
            );
        } catch (error) {
            return false;
        }

        return true;
    }
}
