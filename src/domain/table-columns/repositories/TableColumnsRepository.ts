import { StorageClientFactory } from "../../../data/config/StorageClientFactory";
import { TableColumn } from "../entities/TableColumn";

export interface TableColumnsRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory): TableColumnsRepository;
}

export interface TableColumnsRepository {
    getColumns(id: string): Promise<TableColumn[]>;
    saveColumns(id: string, columns: string[]): Promise<void>;
}
