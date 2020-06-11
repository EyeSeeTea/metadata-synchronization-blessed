import { StorageRepository } from "../../domain/common/repositories/StorageRepository";
import { D2Api, DataStore } from "../../types/d2-api";

const dataStoreNamespace = "metadata-synchronization";

export class StorageDataStoreRepository extends StorageRepository {
    private dataStore: DataStore;

    constructor(private api: D2Api) {
        super();
        this.dataStore = this.api.dataStore(dataStoreNamespace);
    }

    public async getObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const value = await this.dataStore.get<T>(key).getData();
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
