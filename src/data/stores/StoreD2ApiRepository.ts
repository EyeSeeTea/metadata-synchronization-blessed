import { Instance } from "../../domain/instance/entities/Instance";
import { Namespace } from "../../domain/storage/Namespaces";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { Store } from "../../domain/stores/entities/Store";
import { StoreRepository } from "../../domain/stores/repositories/StoreRepository";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

export class StoreD2ApiRepository implements StoreRepository {
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.storageClient = new StorageDataStoreClient(instance);
    }

    public async list(): Promise<Store[]> {
        const stores = await this.storageClient.listObjectsInCollection<Store>(Namespace.STORES);
        return stores.filter(store => !store.deleted);
    }

    public async getById(_id: string): Promise<Store> {
        throw new Error("Method not implemented.");
    }

    public async delete(id: string): Promise<boolean> {
        const store = await this.storageClient.getObjectInCollection<Store>(Namespace.STORES, id);

        if (!store) return false;

        await this.storageClient.saveObjectInCollection(Namespace.STORES, {
            ...store,
            deleted: true,
        });

        return true;
    }

    public async save(store: Store): Promise<void> {
        await this.storageClient.saveObjectInCollection(Namespace.STORES, store);
    }

    public async getDefault(): Promise<Store> {
        throw new Error("Method not implemented.");
    }
}
