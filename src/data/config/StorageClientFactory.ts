import { FutureData } from "../../domain/common/entities/Future";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
/**
 * @description This file is refactored
 */
export interface StorageClientFactory {
    getStorageClient(): FutureData<StorageClient>;
    getUserStorageClient(): FutureData<StorageClient>;
    /**
    @deprecated - We are moving from Promises to Futures, this method will be removed in future refactors.
    use getStorageClient instead
    */
    getStorageClientPromise(): Promise<StorageClient>;
}
