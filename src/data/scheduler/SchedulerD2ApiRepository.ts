import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { SchedulerExecution } from "../../domain/scheduler/entities/SchedulerExecution";
import { SchedulerRepository } from "../../domain/scheduler/repositories/SchedulerRepository";
import { Namespace } from "../storage/Namespaces";
import { SchedulerExecutionModel } from "./models/SchedulerExecutionModel";

export class SchedulerD2ApiRepository implements SchedulerRepository {
    constructor(private configRepository: ConfigRepository) {}

    public async updateLastExecution(execution: SchedulerExecution): Promise<void> {
        const data = SchedulerExecutionModel.encode<SchedulerExecution>(execution);
        const storage = await this.configRepository.getStorageClient();
        return storage.saveObject<SchedulerExecution>(Namespace.SCHEDULER_EXECUTIONS, data);
    }

    public async getLastExecution(): Promise<SchedulerExecution> {
        const storage = await this.configRepository.getStorageClient();
        const data = await storage.getOrCreateObject<SchedulerExecution>(Namespace.SCHEDULER_EXECUTIONS, {});
        return SchedulerExecutionModel.unsafeDecode(data);
    }
}
