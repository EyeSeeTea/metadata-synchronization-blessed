import { FutureData } from "../../common/entities/Future";
import { UseCase } from "../../common/entities/UseCase";
import { SchedulerExecutionInfo } from "../entities/SchedulerExecutionInfo";
import { SchedulerExecutionInfoRepository } from "../repositories/SchedulerExecutionInfoRepositoryConstructor";

/**
 * @description This file is refactored
 */
export class GetLastSchedulerExecutionInfoUseCase implements UseCase {
    constructor(private schedulerExecutionInfoRepository: SchedulerExecutionInfoRepository) {}

    public execute(): FutureData<SchedulerExecutionInfo> {
        return this.schedulerExecutionInfoRepository.getLastExecutionInfo();
    }
}
