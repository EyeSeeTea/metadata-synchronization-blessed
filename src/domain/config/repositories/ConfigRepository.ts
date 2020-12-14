import { Instance } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";

export interface ConfigRepositoryConstructor {
    new (instance: Instance): ConfigRepository;
}

export interface ConfigRepository {
    getStorageClient(): Promise<StorageClient>;
    changeStorageClient(client: "dataStore" | "constant"): Promise<void>;
}
