import _ from "lodash";
import { StorageType } from "../../domain/config/entities/Config";
import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { cache, clear } from "../../utils/cache";
import { Namespace } from "../storage/Namespaces";
import { StorageConstantClient } from "../storage/StorageConstantClient";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

export class ConfigAppRepository implements ConfigRepository {
    private dataStoreClient: StorageDataStoreClient;
    private constantClient: StorageConstantClient;

    constructor(private instance: Instance) {
        this.dataStoreClient = new StorageDataStoreClient(this.instance);
        this.constantClient = new StorageConstantClient(this.instance);
    }

    @cache()
    private async detectStorageClients(): Promise<Array<StorageType>> {
        const dataStoreConfig = await this.dataStoreClient.getObject(Namespace.CONFIG);
        const constantConfig = await this.constantClient.getObject(Namespace.CONFIG);

        return _.compact([dataStoreConfig ? "dataStore" : undefined, constantConfig ? "constant" : undefined]);
    }

    @cache()
    public async getStorageClient(): Promise<StorageClient> {
        const constantConfig = await this.constantClient.getObject(Namespace.CONFIG);
        return constantConfig ? this.constantClient : this.dataStoreClient;
    }

    @cache()
    public async getUserStorageClient(): Promise<StorageClient> {
        const dataStoreClient = new StorageDataStoreClient(this.instance, undefined, { storageType: "user" });

        const constantConfig = await this.constantClient.getObject(Namespace.CONFIG);
        return constantConfig ? this.constantClient : dataStoreClient;
    }

    public async changeStorageClient(client: StorageType): Promise<void> {
        const oldClient = client === "dataStore" ? this.constantClient : this.dataStoreClient;
        const newClient = client === "dataStore" ? this.dataStoreClient : this.constantClient;

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
