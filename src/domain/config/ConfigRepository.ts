import { Instance } from "../instance/entities/Instance";
import { StorageClient } from "../storage/repositories/StorageClient";

export interface ConfigRepository {
    getStorageClient(instance: Instance): Promise<StorageClient>;
    changeStorageClient(instance: Instance, client: "dataStore" | "constant"): Promise<void>;
}
