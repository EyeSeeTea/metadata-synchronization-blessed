import { Instance } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";

export interface ConfigRepositoryConstructor {
    new (instance: Instance): ConfigRepository;
}

export interface ConfigRepository {
    // Storage client should only be accessible from data layer
    // This two methods will be removed in future refactors
    getStorageClient(): Promise<StorageClient>;
    changeStorageClient(client: "dataStore" | "constant"): Promise<void>;
}
