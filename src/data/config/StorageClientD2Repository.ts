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
                const abc = _.compact([
                    dataStoreConfig ? "dataStore" : undefined,
                    constantConfig ? "constant" : undefined,
                ]);
                return abc;
            });
        });
    }

    public getStorageClientFuture(): FutureData<StorageClient> {
        return this.constantClient.getObjectFuture(Namespace.CONFIG).map(constantConfig => {
            return constantConfig ? this.constantClient : this.dataStoreClient;
        });
    }

    public async getStorageClient(): Promise<StorageClient> {
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

    // public changeStorageClient(client: AppStorageType): FutureData<void> {
    //     const dataStoreClient = new StorageDataStoreClient(this.instance);
    //     const constantClient = new StorageConstantClient(this.instance);

    //     const oldClient = client === "dataStore" ? constantClient : dataStoreClient;
    //     const newClient = client === "dataStore" ? dataStoreClient : constantClient;

    //     // TODO: Back-up everything

    //     const clearStorage$ = Future.fromPromise(newClient.clearStorage());
    //     const oldClientClone = Future.fromPromise(oldClient.clone());
    //     const oldClientClear = Future.fromPromise(oldClient.clearStorage());

    //     return clearStorage$.flatMap(_ => {
    //         console.debug("New client cleared");
    //         return oldClientClone.flatMap(dump => {
    //             console.debug("Old client cloned");
    //             const newClientImport = Future.fromPromise(newClient.import(dump));
    //             return newClientImport.flatMap(_ => {
    //                 console.debug("new client imported");
    //                 return oldClientClear.flatMap(_ => {
    //                     console.debug("Old client cleared");
    //                     // clear(this.detectStorageClients, this);
    //                     // clear(this.getStorageClient, this);
    //                     return Future.success(undefined);
    //                 });
    //             });
    //         });
    //     });

    //     // Clear new client
    //     // return Future.fromPromise(clearStorage$).flatMap(() => {
    //     //     console.debug("New client cleared");
    //     //     // Copy old client data into new client
    //     //     return Future.fromPromise(oldClient.clone()).flatMap(dump => {
    //     //         console.debug("Old client cloned");
    //     //         return Future.fromPromise(newClient.import(dump)).flatMap(() => {
    //     //             console.debug("new client imported");
    //     //             // Clear old client
    //     //             return Future.fromPromise(oldClient.clearStorage()).flatMap(() => {
    //     //                 console.debug("Old client cleared");
    //     //                 // Reset memoize
    //     //                 clear(this.detectStorageClients, this);
    //     //                 clear(this.getStorageClient, this);
    //     //                 return Future.success(undefined);
    //     //             });
    //     //         });
    //     //     });
    //     // });
    // }

    public async changeStorageClientPromise(client: AppStorageType): Promise<void> {
        console.debug("Changing storage client to", client);
        const oldClient = client === "dataStore" ? this.constantClient : this.dataStoreClient;
        const newClient = client === "dataStore" ? this.dataStoreClient : this.constantClient;

        // TODO: Back-up everything

        // Clear new client
        await newClient.clearStorage();
        console.debug(`New client cleared`);

        // Copy old client data into new client
        const dump = await oldClient.clone();
        console.debug(`Old client cloned`);

        await newClient.import(dump);
        console.debug(`new client imported`);

        // Clear old client
        await oldClient.clearStorage();
        console.debug(`Old client cleared`);

        // Reset memoize
        clear(this.detectStorageClients, this);

        clear(this.getStorageClient, this);
    }

    public changeStorageClient(client: AppStorageType): FutureData<void> {
        return Future.fromPromise(this.changeStorageClientPromise(client));
    }
}
