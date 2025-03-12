import { Instance } from "../../domain/instance/entities/Instance";
import { AppStorageType } from "../../domain/storage-client-config/entities/StorageConfig";
import { StorageClientRepository } from "../../domain/storage-client-config/repositories/StorageClientRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

export class StorageClientTestRepository implements StorageClientRepository {
    getUserStorageClient(): Promise<StorageClient> {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.36",
        });
        return Promise.resolve(new StorageDataStoreClient(localInstance, undefined, { storageType: "user" }));
    }
    getStorageClient(): Promise<StorageClient> {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.36",
        });
        return Promise.resolve(new StorageDataStoreClient(localInstance, undefined, { storageType: "user" }));
    }
    changeStorageClient(_client: AppStorageType): Promise<void> {
        return Promise.resolve();
    }
}
