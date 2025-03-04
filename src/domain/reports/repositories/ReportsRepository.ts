import { StorageClientRepository } from "../../storage-client-config/repositories/StorageClientRepository";
import { SynchronizationReport } from "../entities/SynchronizationReport";
import { SynchronizationResult } from "../entities/SynchronizationResult";

export interface ReportsRepositoryConstructor {
    new (configRepository: StorageClientRepository): ReportsRepository;
}

export interface ReportsRepository {
    getById(id: string): Promise<SynchronizationReport | undefined>;
    getSyncResults(id: string): Promise<SynchronizationResult[]>;
    list(): Promise<SynchronizationReport[]>;
    save(report: SynchronizationReport): Promise<void>;
    clean(): Promise<void>;
    delete(id: string): Promise<void>;
    deleteByIds(ids: string[]): Promise<void>;
}
