import _ from "lodash";
import { Instance } from "../../domain/instance/entities/Instance";
import { ObjectSharing, StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api, DataStore, DataStoreKeyMetadata } from "../../types/d2-api";
import { Dictionary } from "../../types/utils";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { DataStorageType } from "../../domain/storage-client-config/entities/StorageConfig";
import { Future, FutureData } from "../../domain/common/entities/Future";
import { apiToFuture } from "../common/utils/api-futures";

export const dataStoreNamespace = "metadata-synchronization";

type StorageOptions = {
    storageType: DataStorageType;
};
export class StorageDataStoreClient extends StorageClient {
    public type = "dataStore" as const;

    private api: D2Api;
    private dataStore: DataStore;

    constructor(instance: Instance, namespace: string = dataStoreNamespace, options?: StorageOptions) {
        super();
        this.api = getD2APiFromInstance(instance);
        this.dataStore =
            options?.storageType === "user" ? this.api.userDataStore(namespace) : this.api.dataStore(namespace);
    }

    /**
     * @deprecated - We are moving from Promises to Futures, this method will be removed in future refactors.
     * use getObjectFuture instead
     */
    public async getObject<T extends object>(key: string): Promise<T | undefined> {
        try {
            const value = await this.dataStore.get<T>(key).getData();
            return value;
        } catch (error: any) {
            console.error(error);
            return undefined;
        }
    }

    public getObjectFuture<T extends object>(key: string): FutureData<T | undefined> {
        return Future.fromPromise(this.dataStore.get<T>(key).getData())
            .map(value => value)
            .mapError(error => {
                console.error(error);
                return error;
            });
    }

    public async getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const value = await this.getObject<T>(key);
        if (!value) await this.saveObject(key, defaultValue);
        return value ?? defaultValue;
    }

    /**
     * @deprecated - We are moving from Promises to Futures, this method will be removed in future refactors.
     * use saveObjectFuture instead
     */
    public async saveObject<T extends object>(key: string, value: T): Promise<void> {
        await this.dataStore.save(key, value).getData();
    }

    public saveObjectFuture<T extends object>(key: string, value: T): FutureData<void> {
        return apiToFuture(this.dataStore.save(key, value));
    }

    public async removeObject(key: string): Promise<void> {
        try {
            await this.dataStore.delete(key).getData();
        } catch (error: any) {
            if (!error.response || error.response.status !== 404) {
                throw error;
            }
        }
    }

    public async clearStorage(): Promise<void> {
        const keys = await this.dataStore.getKeys().getData();
        await promiseMap(keys, key => this.removeObject(key));
    }

    public async clone(): Promise<Dictionary<unknown>> {
        const keys = await this.listKeys();

        const pairs = await promiseMap(keys, async key => {
            const value = await this.getObject(key);
            return [key, value];
        });

        return _.fromPairs(pairs);
    }

    public async import(dump: Dictionary<unknown>): Promise<void> {
        const pairs = _.toPairs(dump);

        await promiseMap(pairs, async ([key, value]) => {
            await this.saveObject(key, value as object);
        });
    }

    public async listKeys(): Promise<string[]> {
        return this.dataStore.getKeys().getData();
    }

    public async getObjectSharing(key: string): Promise<ObjectSharing | undefined> {
        const metadata = await this.getMetadataByKey(key);
        if (!metadata) return undefined;

        const { object } = await this.api.sharing.get({ type: "dataStore", id: metadata.id }).getData();

        if (!object) return undefined;

        return {
            user: { name: "", ...metadata.user },
            userAccesses: object.userAccesses || [],
            userGroupAccesses: object.userGroupAccesses || [],
            publicAccess: metadata.publicAccess,
            externalAccess: metadata.externalAccess,
        };
    }

    public async saveObjectSharing(key: string, object: ObjectSharing): Promise<void> {
        const metadata = await this.getMetadataByKey(key);
        if (!metadata) return;

        await this.api.sharing.post({ type: "dataStore", id: metadata.id }, object).getData();
    }

    private async getMetadataByKey(key: string): Promise<DataStoreKeyMetadata | undefined> {
        try {
            const data = await this.dataStore.getMetadata(key).getData();
            if (!data) throw new Error(`Invalid dataStore key ${key}`);

            return data;
        } catch (error: any) {
            console.error(error);
            return undefined;
        }
    }
}
