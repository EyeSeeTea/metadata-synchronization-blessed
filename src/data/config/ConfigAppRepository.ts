import { Instance } from "../../domain/instance/entities/Instance";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { cache, clear } from "../../utils/cache";
import { Namespace } from "../storage/Namespaces";
import { StorageConstantClient } from "../storage/StorageConstantClient";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

interface ConfigRepository {
    getStorageClient(instance: Instance): Promise<StorageClient>;
    changeStorageClient(instance: Instance, client: "dataStore" | "constant"): Promise<void>;
}

export class ConfigAppClient implements ConfigRepository {
    constructor() {}

    @cache()
    public async getStorageClient(instance: Instance): Promise<StorageClient> {
        const dataStoreClient = new StorageDataStoreClient(instance);
        const constantClient = new StorageConstantClient(instance);

        const dataStoreConfig = await dataStoreClient.getObject(Namespace.CONFIG);
        const constantConfig = await constantClient.getObject(Namespace.CONFIG);

        if (dataStoreConfig && constantConfig) {
            // Decide what to do, clear constant maybe?
            console.error("Two storages initialized");
        }

        return dataStoreConfig ? dataStoreClient : constantClient;
    }

    public async changeStorageClient(
        instance: Instance,
        client: "dataStore" | "constant"
    ): Promise<void> {
        const dataStoreClient = new StorageDataStoreClient(instance);
        const constantClient = new StorageConstantClient(instance);

        const oldClient = client === "dataStore" ? constantClient : dataStoreClient;
        const newClient = client === "dataStore" ? dataStoreClient : constantClient;

        console.log({ oldClient, newClient });

        // Clear new client
        // Copy old client data into new client
        // Clear old client

        // Reset memoize
        clear(this.getStorageClient, this);
    }
}
