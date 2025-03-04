import { AppStorageType } from "../../domain/storage-client-config/entities/StorageConfig";
import { StorageClientRepository } from "../../domain/storage-client-config/repositories/StorageClientRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";

export class StorageClientTestRepository implements StorageClientRepository {
    getUserStorageClient(): Promise<StorageClient> {
        throw new Error("Method not implemented.");
    }
    getStorageClient(): Promise<StorageClient> {
        throw new Error("Method not implemented.");
    }
    changeStorageClient(_client: AppStorageType): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
