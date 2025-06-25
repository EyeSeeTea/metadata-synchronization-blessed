import { SynchronizationRule } from "../entities/SynchronizationRule";

export interface RulesRepository {
    getById(id: string): Promise<SynchronizationRule | undefined>;
    list(allProperties?: boolean): Promise<SynchronizationRule[]>;
    save(rules: SynchronizationRule[]): Promise<void>;
    delete(id: string): Promise<void>;
}
