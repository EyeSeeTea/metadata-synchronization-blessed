import { Instance } from "../../domain/instance/entities/Instance";
import { SchedulerExecutionInfo } from "../../domain/scheduler/entities/SchedulerExecutionInfo";
import { SchedulerExecutionInfoRepository } from "../../domain/scheduler/repositories/SchedulerExecutionInfoRepositoryConstructor";
import { Namespace } from "../storage/Namespaces";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
import { SchedulerExecutionInfoModel } from "./models/SchedulerExecutionInfoModel";

export class SchedulerExecutionInfoD2ApiRepository implements SchedulerExecutionInfoRepository {
    private dataStoreClient: StorageDataStoreClient;

    constructor(private instance: Instance) {
        this.dataStoreClient = new StorageDataStoreClient(this.instance);
    }

    public async updateExecutionInfo(execution: SchedulerExecutionInfo): Promise<void> {
        const data = SchedulerExecutionInfoModel.encode<SchedulerExecutionInfo>(execution);
        return this.dataStoreClient.saveObject<SchedulerExecutionInfo>(Namespace.SCHEDULER_EXECUTIONS, data);
    }

    public async getLastExecutionInfo(): Promise<SchedulerExecutionInfo> {
        const data = await this.dataStoreClient.getOrCreateObject<SchedulerExecutionInfo>(
            Namespace.SCHEDULER_EXECUTIONS,
            {}
        );
        return SchedulerExecutionInfoModel.unsafeDecode(data);
    }
}
