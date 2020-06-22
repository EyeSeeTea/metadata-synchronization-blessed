import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";

export class DeleteModuleUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<Boolean> {
        try {
            await this.storageRepository.removeObjectInCollection(Namespace.MODULES, id);
        } catch (error) {
            return false;
        }

        return true;
    }
}
