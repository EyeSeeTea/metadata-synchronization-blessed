import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Store } from "../entities/Store";

export class DeleteStoreUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<boolean> {
        const store = await this.storageRepository.getObjectInCollection<Store>(
            Namespace.STORES,
            id
        );

        try {
            if (!store) return false;

            await this.storageRepository.saveObjectInCollection(Namespace.STORES, {
                ...store,
                deleted: true,
            });
        } catch (error) {
            return false;
        }

        return true;
    }
}
