import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Store } from "../entities/Store";

type SetStoreAsDefaultError = {
    kind: "SetStoreAsDefaultError";
};

export class SetStoreAsDefaultUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<Either<SetStoreAsDefaultError, void>> {
        try {
            const stores = await this.storageRepository.listObjectsInCollection<Store>(
                Namespace.STORES
            );

            const newStores = stores.map(store => ({ ...store, default: store.id === id }));

            await this.storageRepository.saveObject(Namespace.STORES, newStores);

            return Either.success(undefined);
        } catch {
            return Either.error({
                kind: "SetStoreAsDefaultError",
            });
        }
    }
}
