import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";

export class DeletePackageUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<boolean> {
        try {
            await this.storageRepository.removeObjectInCollection(Namespace.PACKAGES, id);
        } catch (error) {
            return false;
        }

        return true;
    }
}
