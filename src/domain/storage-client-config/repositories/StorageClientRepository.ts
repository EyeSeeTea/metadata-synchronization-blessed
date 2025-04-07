import { FutureData } from "../../common/entities/Future";
import { Instance } from "../../instance/entities/Instance";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { AppStorageType } from "../entities/StorageConfig";

export interface StorageClientRepositoryConstructor {
    new (instance: Instance): StorageClientRepository;
}

export interface StorageClientRepository {
    getStorageClient(): FutureData<StorageClient>; //This returns the default storage client
    getUserStorageClient(): FutureData<StorageClient>;
    changeStorageClient(client: AppStorageType): FutureData<void>;

    /**
    @deprecated - We are moving from Promises to Futures, this method will be removed in future refactors.
    use getStorageClient instead
    */
    getStorageClientPromise(): Promise<StorageClient>;
}
