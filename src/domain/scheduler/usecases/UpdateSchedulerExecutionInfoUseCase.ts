import { FutureData } from "../../common/entities/Future";
import { UseCase } from "../../common/entities/UseCase";
import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";
import { SchedulerExecutionInfoRepository } from "../repositories/SchedulerExecutionInfoRepositoryConstructor";

/**
 * @description This file is refactored
 */
export class UpdateSchedulerExecutionInfoUseCase implements UseCase {
    constructor(private schedulerExecutionInfoRepository: SchedulerExecutionInfoRepository) {}

    public execute(executionInfo: SchedulerExecutionInfo): FutureData<void> {
        return this.schedulerExecutionInfoRepository.updateExecutionInfo(executionInfo);
    }
}
