import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export interface RulesRepositoryConstructor {
    new (configRepository: ConfigRepository): RulesRepository;
}

export interface RulesRepository {
    getById(id: string): Promise<SynchronizationRule | undefined>;
    list(): Promise<SynchronizationRule[]>;
    save(report: SynchronizationRule): Promise<void>;
    delete(id: string): Promise<void>;
}
