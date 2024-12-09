import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { TableColumnsRepository } from "../../domain/table-columns/repositories/TableColumnsRepository";

export class TableColumnsDataStoreRepository implements TableColumnsRepository {
    constructor(private configRepository: ConfigRepository) {}

    async getColumns(namespace: string): Promise<string[]> {
        const storageClient = await this.getStorageClient();
        const columns = await storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        const storageClient = await this.getStorageClient();

        return storageClient.saveObject(namespace, columns);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient({ userStorage: true });
    }
}
