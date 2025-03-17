import { FutureData } from "../../domain/common/entities/Future";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
/**
 * @description This file is refactored
 */
export interface StorageClientFactory {
    getStorageClient(): Promise<StorageClient>;
    getStorageClientFuture(): FutureData<StorageClient>;
    getUserStorageClient(): FutureData<StorageClient>;
}
