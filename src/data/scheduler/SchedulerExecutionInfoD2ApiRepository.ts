import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { SchedulerExecutionInfo } from "../../domain/scheduler/entities/SchedulerExecutionInfo";
import { SchedulerExecutionInfoRepository } from "../../domain/scheduler/repositories/SchedulerExecutionInfoRepositoryConstructor";
import { Namespace } from "../storage/Namespaces";
import { SchedulerExecutionInfoModel } from "./models/SchedulerExecutionInfoModel";

export class SchedulerExecutionInfoD2ApiRepository implements SchedulerExecutionInfoRepository {
    constructor(private configRepository: ConfigRepository) {}

    public async updateExecutionInfo(execution: SchedulerExecutionInfo): Promise<void> {
        const data = SchedulerExecutionInfoModel.encode<SchedulerExecutionInfo>(execution);
        const storage = await this.configRepository.getStorageClient();
        return storage.saveObject<SchedulerExecutionInfo>(Namespace.SCHEDULER_EXECUTIONS, data);
    }

    public async getLastExecutionInfo(): Promise<SchedulerExecutionInfo> {
        const storage = await this.configRepository.getStorageClient();
        const data = await storage.getOrCreateObject<SchedulerExecutionInfo>(Namespace.SCHEDULER_EXECUTIONS, {});
        return SchedulerExecutionInfoModel.unsafeDecode(data);
    }
}
