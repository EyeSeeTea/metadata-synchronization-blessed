import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { Store } from "../entities/Store";

export class GetStoreUseCase implements UseCase {
    constructor(private storageRepository: StorageClient) {}

    public async execute(id: string): Promise<Store | undefined> {
        const store = this.storageRepository.getObjectInCollection<Store>(Namespace.STORES, id);

        return store;
    }
}
