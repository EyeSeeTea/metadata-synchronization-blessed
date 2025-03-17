import { FutureData } from "../../common/entities/Future";
import { Instance } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { AppStorageType } from "../entities/StorageConfig";

export interface StorageClientRepositoryConstructor {
    new (instance: Instance): StorageClientRepository;
}

export interface StorageClientRepository {
    // Storage client should only be accessible from data layer
    // This two methods will be removed in future refactors
    getStorageClientFuture(): FutureData<StorageClient>; //This returns the default storage client
    getStorageClient(): Promise<StorageClient>; //This returns the default storage client
    getUserStorageClient(): FutureData<StorageClient>;
    changeStorageClient(client: AppStorageType): FutureData<void>;
}
