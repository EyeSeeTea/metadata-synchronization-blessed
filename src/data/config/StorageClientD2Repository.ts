import _ from "lodash";
import { AppStorageType } from "../../domain/storage-client-config/entities/StorageConfig";
import { StorageClientRepository } from "../../domain/storage-client-config/repositories/StorageClientRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { cache, clear } from "../../utils/cache";
import { Namespace } from "../storage/Namespaces";
import { StorageConstantClient } from "../storage/StorageConstantClient";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
import { StorageClientFactory } from "./StorageClientFactory";
import { Future, FutureData } from "../../domain/common/entities/Future";

/**
 * @description This file is refactored
 */

export class StorageClientD2Repository implements StorageClientRepository, StorageClientFactory {
    private dataStoreClient: StorageDataStoreClient;
    private constantClient: StorageConstantClient;

    constructor(private instance: Instance) {
        this.dataStoreClient = new StorageDataStoreClient(this.instance);
        this.constantClient = new StorageConstantClient(this.instance);
    }

    @cache()
    private detectStorageClients(): FutureData<Array<AppStorageType>> {
        return this.dataStoreClient.getObjectFuture(Namespace.CONFIG).flatMap(dataStoreConfig => {
            return this.constantClient.getObjectFuture(Namespace.CONFIG).map(constantConfig => {
                return _.compact([dataStoreConfig ? "dataStore" : undefined, constantConfig ? "constant" : undefined]);
            });
        });
    }

    public getStorageClient(): FutureData<StorageClient> {
        return this.constantClient.getObjectFuture(Namespace.CONFIG).map(constantConfig => {
            return constantConfig ? this.constantClient : this.dataStoreClient;
        });
    }

    /**
    @deprecated - We are moving from Promises to Futures, this method will be removed in future refactors.
    use getStorageClient instead
    */
    public async getStorageClientPromise(): Promise<StorageClient> {
        const constantConfig = await this.constantClient.getObject(Namespace.CONFIG);
        return constantConfig ? this.constantClient : this.dataStoreClient;
    }

    @cache()
    public getUserStorageClient(): FutureData<StorageClient> {
        const dataStoreClient = new StorageDataStoreClient(this.instance, undefined, { storageType: "user" });

        return this.constantClient.getObjectFuture(Namespace.CONFIG).map(constantConfig => {
            return constantConfig ? this.constantClient : dataStoreClient;
        });
    }

    /**
    @todo - We are moving from Promises to Futures, this method should return 
            a future after refactor of data store and constant clients
    */
    public async changeStorageClientPromise(client: AppStorageType): Promise<void> {
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
        clear(this.getUserStorageClient, this);
    }

    public changeStorageClient(client: AppStorageType): FutureData<void> {
        return Future.fromPromise(this.changeStorageClientPromise(client));
    }
}
