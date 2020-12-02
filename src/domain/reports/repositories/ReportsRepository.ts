import { Instance } from "../../instance/entities/Instance";
import { SynchronizationReport } from "../entities/SynchronizationReport";

export interface ReportsRepositoryConstructor {
    new (instance: Instance): ReportsRepository;
}

export interface ReportsRepository {
    getById(id: string): Promise<SynchronizationReport | undefined>;
    list(): Promise<SynchronizationReport[]>;
    save(report: SynchronizationReport): Promise<void>;
    delete(id: string): Promise<void>;
}
