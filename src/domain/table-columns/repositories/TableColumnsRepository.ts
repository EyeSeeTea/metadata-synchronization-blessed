import { TableColumn } from "../entities/TableColumn";

export interface TableColumnsRepository {
    getColumns(id: string): Promise<TableColumn[]>;
    saveColumns(id: string, columns: string[]): Promise<void>;
}
