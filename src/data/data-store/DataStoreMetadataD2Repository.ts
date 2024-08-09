import _ from "lodash";
import { DataStoreMetadata } from "../../domain/data-store/DataStoreMetadata";
import { DataStoreMetadataRepository } from "../../domain/data-store/DataStoreMetadataRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { Stats } from "../../domain/reports/entities/Stats";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { promiseMap } from "../../utils/common";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

export class DataStoreMetadataD2Repository implements DataStoreMetadataRepository {
    private instance: Instance;

    constructor(instance: Instance) {
        this.instance = instance;
    }

    async get(dataStores: DataStoreMetadata[]): Promise<DataStoreMetadata[]> {
        const result = await promiseMap(dataStores, async dataStore => {
            const dataStoreClient = new StorageDataStoreClient(this.instance, dataStore.namespace);
            const dataStoreWithValue = this.getValuesByDataStore(dataStoreClient, dataStore);
            return dataStoreWithValue;
        });
        return result;
    }

    private async getValuesByDataStore(
        dataStoreClient: StorageDataStoreClient,
        dataStore: DataStoreMetadata
    ): Promise<DataStoreMetadata> {
        const keys = await this.getAllKeys(dataStoreClient, dataStore);
        const keyWithValue = await promiseMap(keys, async key => {
            const keyValue = await dataStoreClient.getObject(key.id);
            return { id: key.id, value: keyValue };
        });
        const keyInNamespace = _(dataStore.keys).first()?.id;
        const sharing = keyInNamespace ? await dataStoreClient.getObjectSharing(keyInNamespace) : undefined;
        return new DataStoreMetadata({
            namespace: dataStore.namespace,
            keys: keyWithValue,
            sharing,
        });
    }

    private async getAllKeys(
        dataStoreClient: StorageDataStoreClient,
        dataStore: DataStoreMetadata
    ): Promise<DataStoreMetadata["keys"]> {
        if (dataStore.keys.length > 0) return dataStore.keys;
        const keys = await dataStoreClient.listKeys();
        return keys.map(key => ({ id: key, value: "" }));
    }

    async save(dataStores: DataStoreMetadata[]): Promise<SynchronizationResult> {
        const keysIdsToDelete = await this.getKeysToDelete(dataStores);

        const resultStats = await promiseMap(dataStores, async dataStore => {
            const dataStoreClient = new StorageDataStoreClient(this.instance, dataStore.namespace);
            const stats = await promiseMap(dataStore.keys, async key => {
                const exist = await dataStoreClient.getObject(key.id);
                await dataStoreClient.saveObject(key.id, key.value);
                if (dataStore.sharing) {
                    await dataStoreClient.saveObjectSharing(key.id, dataStore.sharing);
                }
                return exist ? Stats.createOrEmpty({ updated: 1 }) : Stats.createOrEmpty({ imported: 1 });
            });
            return stats;
        });

        const deleteStats = await promiseMap(keysIdsToDelete, async keyId => {
            const [namespace, key] = keyId.split(DataStoreMetadata.NS_SEPARATOR);
            const dataStoreClient = new StorageDataStoreClient(this.instance, namespace);
            await dataStoreClient.removeObject(key);
            return Stats.createOrEmpty({ deleted: 1 });
        });

        const allStats = resultStats.flatMap(result => result).concat(deleteStats);
        const dataStoreStats = { ...Stats.combine(allStats.map(stat => Stats.create(stat))), type: "DataStore Keys" };

        const result: SynchronizationResult = {
            date: new Date(),
            instance: this.instance,
            status: "SUCCESS",
            type: "metadata",
            stats: dataStoreStats,
            typeStats: [dataStoreStats],
        };

        return result;
    }

    private async getKeysToDelete(dataStores: DataStoreMetadata[]): Promise<string[]> {
        const allKeysToDelete = await promiseMap(dataStores, async dataStore => {
            if (dataStore.action === "MERGE") return [];

            const existingRecords = await this.get([{ ...dataStore, keys: [] }]);
            const existingKeysIds = existingRecords.flatMap(dataStore => {
                return dataStore.keys.map(key => DataStoreMetadata.generateKeyId(dataStore.namespace, key.id));
            });

            const keysIdsToSave = dataStores.flatMap(dataStore => {
                return dataStore.keys.map(key => DataStoreMetadata.generateKeyId(dataStore.namespace, key.id));
            });

            const keysIdsToDelete = existingKeysIds.filter(id => !keysIdsToSave.includes(id));
            return keysIdsToDelete;
        });

        return allKeysToDelete.flat();
    }
}
