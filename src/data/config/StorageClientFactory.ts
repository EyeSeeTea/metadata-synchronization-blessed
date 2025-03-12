import { StorageClient } from "../../domain/storage/repositories/StorageClient";

export interface StorageClientFactory {
    getStorageClient(): Promise<StorageClient>;
    getUserStorageClient(): Promise<StorageClient>;
}
