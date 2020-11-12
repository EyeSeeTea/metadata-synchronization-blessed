import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Store } from "../entities/Store";

export class ListStoresUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(): Promise<Store[]> {
        const stores = await this.storageRepository.listObjectsInCollection<Store>(
            Namespace.STORES
        );

        return stores.filter(store => !store.deleted);
    }
}
