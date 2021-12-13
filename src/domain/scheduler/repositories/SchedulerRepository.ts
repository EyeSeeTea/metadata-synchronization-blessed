import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { SchedulerExecution } from "../entities/SchedulerExecution";

export interface SchedulerRepositoryConstructor {
    new (configRepository: ConfigRepository): SchedulerRepository;
}

export interface SchedulerRepository {
    updateLastExecution(execution: SchedulerExecution): Promise<void>;
    getLastExecution(): Promise<SchedulerExecution>;
}
