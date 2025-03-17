import { StorageClientFactory } from "../../../data/config/StorageClientFactory";
import { UserRepository } from "../../user/repositories/UserRepository";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export interface RulesRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory, userRepository: UserRepository): RulesRepository;
}

export interface RulesRepository {
    getById(id: string): Promise<SynchronizationRule | undefined>;
    list(): Promise<SynchronizationRule[]>;
    save(rules: SynchronizationRule[]): Promise<void>;
    delete(id: string): Promise<void>;
}
