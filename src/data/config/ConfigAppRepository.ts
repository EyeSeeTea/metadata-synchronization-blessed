import _ from "lodash";
import { ConfigRepository } from "../../domain/config/ConfigRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { cache, clear } from "../../utils/cache";
import { Namespace } from "../storage/Namespaces";
import { StorageConstantClient } from "../storage/StorageConstantClient";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

export class ConfigAppRepository implements ConfigRepository {
    constructor(private instance: Instance) {}

    public async detectStorageClients(): Promise<Array<"dataStore" | "constant">> {
        const dataStoreClient = new StorageDataStoreClient(this.instance);
        const constantClient = new StorageConstantClient(this.instance);

        const dataStoreConfig = await dataStoreClient.getObject(Namespace.CONFIG);
        const constantConfig = await constantClient.getObject(Namespace.CONFIG);

        return _.compact([
            dataStoreConfig ? "dataStore" : undefined,
            constantConfig ? "constant" : undefined,
        ]);
    }

    @cache()
    public async getStorageClient(): Promise<StorageClient> {
        const dataStoreClient = new StorageDataStoreClient(this.instance);
        const constantClient = new StorageConstantClient(this.instance);

        const dataStoreConfig = await dataStoreClient.getObject(Namespace.CONFIG);
        return dataStoreConfig ? dataStoreClient : constantClient;
    }

    public async changeStorageClient(client: "dataStore" | "constant"): Promise<void> {
        const dataStoreClient = new StorageDataStoreClient(this.instance);
        const constantClient = new StorageConstantClient(this.instance);

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
