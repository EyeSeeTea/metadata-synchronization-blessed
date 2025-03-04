import { Instance } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { StorageType } from "../entities/Config";

export interface ConfigRepositoryConstructor {
    new (instance: Instance): ConfigRepository;
}

export interface ConfigRepository {
    // Storage client should only be accessible from data layer
    // This two methods will be removed in future refactors
    getStorageClient(): Promise<StorageClient>; //This returns the default storage client
    getUserStorageClient(): Promise<StorageClient>;
    changeStorageClient(client: StorageType): Promise<void>;
}
