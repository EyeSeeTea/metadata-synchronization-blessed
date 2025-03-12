import { StorageClientFactory } from "../../../data/config/StorageClientFactory";
import { SchedulerExecution } from "../entities/SchedulerExecution";

export interface SchedulerRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory): SchedulerRepository;
}

export interface SchedulerRepository {
    updateLastExecution(execution: SchedulerExecution): Promise<void>;
    getLastExecution(): Promise<SchedulerExecution>;
}
