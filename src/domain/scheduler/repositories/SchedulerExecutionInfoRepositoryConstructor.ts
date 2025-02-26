import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";

export interface SchedulerExecutionInfoRepositoryConstructor {
    new (configRepository: ConfigRepository): SchedulerExecutionInfoRepository;
}

export interface SchedulerExecutionInfoRepository {
    updateExecutionInfo(executionInfo: SchedulerExecutionInfo): Promise<void>;
    getLastExecutionInfo(): Promise<SchedulerExecutionInfo>;
}
