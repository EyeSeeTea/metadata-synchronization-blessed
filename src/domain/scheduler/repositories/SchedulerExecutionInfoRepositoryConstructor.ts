import { Instance } from "../../instance/entities/Instance";
import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";

export interface SchedulerExecutionInfoRepositoryConstructor {
    new (instance: Instance): SchedulerExecutionInfoRepository;
}

export interface SchedulerExecutionInfoRepository {
    updateExecutionInfo(executionInfo: SchedulerExecutionInfo): Promise<void>;
    getLastExecutionInfo(): Promise<SchedulerExecutionInfo>;
}
