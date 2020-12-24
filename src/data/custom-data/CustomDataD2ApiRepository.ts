import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { CustomData } from "../../domain/custom-data/entities/CustomData";
import { CustomDataRepository } from "../../domain/custom-data/repository/CustomDataRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";

export class CustomDataD2ApiRepository implements CustomDataRepository {
    constructor(private configRepository: ConfigRepository) {}

    async get(customDataKey: string): Promise<CustomData | undefined> {
        const storageClient = await this.getStorageClient();
        return await storageClient.getObject<CustomData>(customDataKey);
    }
    async save(customDataKey: string, data: CustomData): Promise<void> {
        const storageClient = await this.getStorageClient();
        await storageClient.saveObject(customDataKey, data);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
