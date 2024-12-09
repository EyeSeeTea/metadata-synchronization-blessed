import { ConfigRepository } from "../../config/repositories/ConfigRepository";

export interface TableColumnsRepositoryConstructor {
    new (configRepository: ConfigRepository): TableColumnsRepository;
}

export interface TableColumnsRepository {
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}
