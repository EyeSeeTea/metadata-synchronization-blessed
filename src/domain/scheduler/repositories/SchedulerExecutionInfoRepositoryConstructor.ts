import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";
import { FutureData } from "../../common/entities/Future";

/**
 * @description This file is refactored
 */
export interface SchedulerExecutionInfoRepository {
    updateExecutionInfo(executionInfo: SchedulerExecutionInfo): FutureData<void>;
    getLastExecutionInfo(): FutureData<SchedulerExecutionInfo>;
}
