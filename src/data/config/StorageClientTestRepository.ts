import { Future, FutureData } from "../../domain/common/entities/Future";
import { Instance } from "../../domain/instance/entities/Instance";
import { AppStorageType } from "../../domain/storage-client-config/entities/StorageConfig";
import { StorageClientRepository } from "../../domain/storage-client-config/repositories/StorageClientRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
/**
 * @description This file is refactored
 */
export class StorageClientTestRepository implements StorageClientRepository {
    getUserStorageClient(): FutureData<StorageClient> {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.36",
        });
        return Future.success(new StorageDataStoreClient(localInstance, undefined, { storageType: "user" }));
    }
    getStorageClientPromise(): Promise<StorageClient> {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.36",
        });
        return Promise.resolve(new StorageDataStoreClient(localInstance));
    }
    getStorageClient(): FutureData<StorageClient> {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.36",
        });
        return Future.success(new StorageDataStoreClient(localInstance, undefined, { storageType: "user" }));
    }
    changeStorageClient(_client: AppStorageType): FutureData<void> {
        return Future.success(undefined);
    }
}
