import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { SynchronizationReport } from "../entities/SynchronizationReport";
import { SynchronizationResult } from "../entities/SynchronizationResult";

export interface ReportsRepositoryConstructor {
    new (configRepository: ConfigRepository): ReportsRepository;
}

export interface ReportsRepository {
    getById(id: string): Promise<SynchronizationReport | undefined>;
    getSyncResults(id: string): Promise<SynchronizationResult[]>;
    list(): Promise<SynchronizationReport[]>;
    save(report: SynchronizationReport): Promise<void>;
    clean(): Promise<void>;
    delete(id: string): Promise<void>;
}
