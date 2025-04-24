import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { TableColumn } from "../../domain/table-columns/entities/TableColumn";
import { TableColumnsRepository } from "../../domain/table-columns/repositories/TableColumnsRepository";
import { StorageClientFactory } from "../config/StorageClientFactory";

export class TableColumnsDataStoreRepository implements TableColumnsRepository {
    constructor(private storageClientFactory: StorageClientFactory) {}

    async getColumns(namespace: string): Promise<TableColumn[]> {
        const storageClient = await this.getStorageClient();
        const columns = await storageClient.getObject<TableColumn[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: TableColumn[]): Promise<void> {
        const storageClient = await this.getStorageClient();

        return storageClient.saveObject(namespace, columns);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.storageClientFactory.getUserStorageClient().toPromise();
    }
}
