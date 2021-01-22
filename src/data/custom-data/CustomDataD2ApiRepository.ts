import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { CustomData } from "../../domain/custom-data/entities/CustomData";
import { CustomDataRepository } from "../../domain/custom-data/repository/CustomDataRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";

export class CustomDataD2ApiRepository implements CustomDataRepository {
    constructor(private configRepository: ConfigRepository) {}

    async get<T extends CustomData>(key: string): Promise<T | undefined> {
        const storageClient = await this.getStorageClient();
        return storageClient.getObject<T>(key);
    }
    async save<T extends CustomData>(key: string, data: T): Promise<void> {
        const storageClient = await this.getStorageClient();
        await storageClient.saveObject<T>(key, data);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
