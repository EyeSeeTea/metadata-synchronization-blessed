import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export interface RulesRepositoryConstructor {
    new (instance: Instance): RulesRepository;
}

export interface RulesRepository {
    getById(id: string): Promise<SynchronizationRule | undefined>;
    list(): Promise<SynchronizationRule[]>;
    save(report: SynchronizationRule): Promise<void>;
    delete(id: string): Promise<void>;
}
