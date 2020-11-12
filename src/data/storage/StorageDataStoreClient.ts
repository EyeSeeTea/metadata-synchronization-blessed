import { Instance } from "../../domain/instance/entities/Instance";
import { StorageRepository } from "../../domain/storage/repositories/StorageRepository";
import { D2Api, DataStore } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";

const dataStoreNamespace = "metadata-synchronization";

export class StorageDataStoreRepository extends StorageRepository {
    private api: D2Api;
    private dataStore: DataStore;

    constructor(instance: Instance) {
        super();
        this.api = getD2APiFromInstance(instance);
        this.dataStore = this.api.dataStore(dataStoreNamespace);
    }

    public async getObject<T extends object>(key: string): Promise<T | undefined> {
        const value = await this.dataStore.get<T>(key).getData();
        return value;
    }

    public async getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const value = await this.getObject<T>(key);
        if (!value) await this.saveObject(key, defaultValue);
        return value ?? defaultValue;
    }

    public async saveObject<T extends object>(key: string, value: T): Promise<void> {
        await this.dataStore.save(key, value).getData();
    }

    public async removeObject(key: string): Promise<void> {
        try {
            await this.dataStore.delete(key).getData();
        } catch (error) {
            if (!error.response || error.response.status !== 404) {
                throw error;
            }
        }
    }
}
