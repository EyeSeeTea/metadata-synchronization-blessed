import _ from "lodash";
import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { cache, clear } from "../../utils/cache";
import { Namespace } from "../storage/Namespaces";
import { StorageConstantClient } from "../storage/StorageConstantClient";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

export class ConfigAppRepository implements ConfigRepository {
    constructor(private instance: Instance) {}

    @cache()
    public async detectStorageClients(): Promise<Array<"dataStore" | "constant">> {
        const dataStoreClient = new StorageDataStoreClient(this.instance);
        const constantClient = new StorageConstantClient(this.instance);

        const dataStoreConfig = await dataStoreClient.getObject(Namespace.CONFIG);
        const constantConfig = await constantClient.getObject(Namespace.CONFIG);

        return _.compact([dataStoreConfig ? "dataStore" : undefined, constantConfig ? "constant" : undefined]);
    }

    @cache()
    public async getStorageClient(): Promise<StorageClient> {
        const dataStoreClient = new StorageDataStoreClient(this.instance);
        const constantClient = new StorageConstantClient(this.instance);

        const constantConfig = await constantClient.getObject(Namespace.CONFIG);
        return constantConfig ? constantClient : dataStoreClient;
    }

    public async changeStorageClient(client: "dataStore" | "constant"): Promise<void> {
        const dataStoreClient = new StorageDataStoreClient(this.instance);
        const constantClient = new StorageConstantClient(this.instance);

        const oldClient = client === "dataStore" ? constantClient : dataStoreClient;
        const newClient = client === "dataStore" ? dataStoreClient : constantClient;

        // TODO: Back-up everything

        // Clear new client
        await newClient.clearStorage();

        // Copy old client data into new client
        const dump = await oldClient.clone();
        await newClient.import(dump);

        // Clear old client
        await oldClient.clearStorage();

        // Reset memoize
        clear(this.detectStorageClients, this);
        clear(this.getStorageClient, this);
    }
}
