
import { StorageType } from "../../domain/config/entities/Config";
import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";

export class ConfigTestRepository implements ConfigRepository {
    getUserStorageClient(): Promise<StorageClient> {
        throw new Error("Method not implemented.");
    }
    getStorageClient(): Promise<StorageClient> {
        throw new Error("Method not implemented.");
    }
    changeStorageClient(_client: StorageType): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
