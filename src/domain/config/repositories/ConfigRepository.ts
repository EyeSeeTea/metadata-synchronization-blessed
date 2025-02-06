import { Instance } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { DataStorageType, StorageType } from "../entities/Config";

export interface ConfigRepositoryConstructor {
    new (instance: Instance): ConfigRepository;
}

export interface ConfigRepository {
    // Storage client should only be accessible from data layer
    // This two methods will be removed in future refactors
    getStorageClient(options?: { storageType: DataStorageType }): Promise<StorageClient>;
    changeStorageClient(client: StorageType): Promise<void>;
}
