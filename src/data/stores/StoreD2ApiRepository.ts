import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { Store } from "../../domain/stores/entities/Store";
import { StoreRepository } from "../../domain/stores/repositories/StoreRepository";
import { Namespace } from "../storage/Namespaces";

export class StoreD2ApiRepository implements StoreRepository {
    constructor(private configRepository: ConfigRepository) {}

    public async list(): Promise<Store[]> {
        const storageClient = await this.getStorageClient();
        const stores = await storageClient.listObjectsInCollection<Store>(Namespace.STORES);
        return stores.filter(store => !store.deleted);
    }

    public async getById(id: string): Promise<Store | undefined> {
        const storageClient = await this.getStorageClient();
        const stores = await storageClient.listObjectsInCollection<Store>(Namespace.STORES);
        return stores.find(store => store.id === id);
    }

    public async delete(id: string): Promise<boolean> {
        const storageClient = await this.getStorageClient();

        const store = await storageClient.getObjectInCollection<Store>(Namespace.STORES, id);
        if (!store) return false;

        await storageClient.saveObjectInCollection(Namespace.STORES, {
            ...store,
            deleted: true,
        });

        return true;
    }

    public async save(store: Store): Promise<void> {
        const storageClient = await this.getStorageClient();
        await storageClient.saveObjectInCollection(Namespace.STORES, store);
    }

    public async getDefault(): Promise<Store | undefined> {
        const stores = await this.list();
        return stores.find(store => store.default);
    }

    public async setDefault(id: string): Promise<void> {
        const stores = await this.list();
        const newStores = stores.map(store => ({ ...store, default: store.id === id }));

        const storageClient = await this.getStorageClient();
        await storageClient.saveObject(Namespace.STORES, newStores);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
