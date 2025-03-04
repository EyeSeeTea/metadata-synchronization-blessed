import { StorageClientRepository } from "../../storage-client-config/repositories/StorageClientRepository";
import { SchedulerExecution } from "../entities/SchedulerExecution";

export interface SchedulerRepositoryConstructor {
    new (configRepository: StorageClientRepository): SchedulerRepository;
}

export interface SchedulerRepository {
    updateLastExecution(execution: SchedulerExecution): Promise<void>;
    getLastExecution(): Promise<SchedulerExecution>;
}
