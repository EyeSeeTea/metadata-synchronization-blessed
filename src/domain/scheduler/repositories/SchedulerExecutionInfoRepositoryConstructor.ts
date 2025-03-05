import { Instance } from "../../instance/entities/Instance";
import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";
import { FutureData } from "../../common/entities/Future";

/**
 * @todo We need to remove SchedulerExecutionInfoRepositoryConstructor concept
 */
export interface SchedulerExecutionInfoRepositoryConstructor {
    new (instance: Instance): SchedulerExecutionInfoRepository;
}

export interface SchedulerExecutionInfoRepository {
    updateExecutionInfo(executionInfo: SchedulerExecutionInfo): FutureData<void>;
    getLastExecutionInfo(): FutureData<SchedulerExecutionInfo>;
}
