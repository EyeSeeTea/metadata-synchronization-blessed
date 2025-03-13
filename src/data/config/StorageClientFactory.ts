import { StorageClient } from "../../domain/storage/repositories/StorageClient";
/**
 * @description This file is refactored
 */
export interface StorageClientFactory {
    getStorageClient(): Promise<StorageClient>;
    getUserStorageClient(): Promise<StorageClient>;
}
