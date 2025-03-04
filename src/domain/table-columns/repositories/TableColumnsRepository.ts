import { StorageClientRepository } from "../../storage-client-config/repositories/StorageClientRepository";
import { TableColumn } from "../entities/TableColumn";

export interface TableColumnsRepositoryConstructor {
    new (configRepository: StorageClientRepository): TableColumnsRepository;
}

export interface TableColumnsRepository {
    getColumns(id: string): Promise<TableColumn[]>;
    saveColumns(id: string, columns: string[]): Promise<void>;
}
