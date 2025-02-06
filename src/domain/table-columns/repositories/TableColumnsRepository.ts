import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { TableColumn } from "../entities/TableColumn";

export interface TableColumnsRepositoryConstructor {
    new (configRepository: ConfigRepository): TableColumnsRepository;
}

export interface TableColumnsRepository {
    getColumns(id: string): Promise<TableColumn[]>;
    saveColumns(id: string, columns: string[]): Promise<void>;
}
