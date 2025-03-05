import { Future, FutureData } from "../../domain/common/entities/Future";
import { Instance } from "../../domain/instance/entities/Instance";
import { SchedulerExecutionInfo } from "../../domain/scheduler/entities/SchedulerExecutionInfo";
import { SchedulerExecutionInfoRepository } from "../../domain/scheduler/repositories/SchedulerExecutionInfoRepositoryConstructor";
import { Namespace } from "../storage/Namespaces";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
import { SchedulerExecutionInfoModel } from "./models/SchedulerExecutionInfoModel";

/**
 * @todo This file is refactored but in the constructor instead of Instance whe should get D2Api or directly DataStoreClient
 */
export class SchedulerExecutionInfoD2ApiRepository implements SchedulerExecutionInfoRepository {
    private dataStoreClient: StorageDataStoreClient;

    constructor(private instance: Instance) {
        this.dataStoreClient = new StorageDataStoreClient(this.instance);
    }

    public updateExecutionInfo(execution: SchedulerExecutionInfo): FutureData<void> {
        const data = SchedulerExecutionInfoModel.encode<SchedulerExecutionInfo>(execution);
        return Future.fromPromise(
            this.dataStoreClient.saveObject<SchedulerExecutionInfo>(Namespace.SCHEDULER_EXECUTIONS, data)
        ).flatMap(() => {
            return Future.success(undefined);
        });
    }

    public getLastExecutionInfo(): FutureData<SchedulerExecutionInfo> {
        return Future.fromPromise(
            this.dataStoreClient.getOrCreateObject<SchedulerExecutionInfo>(Namespace.SCHEDULER_EXECUTIONS, {})
        ).flatMap(data => {
            const schedulerExecutionInfo: SchedulerExecutionInfo = SchedulerExecutionInfoModel.unsafeDecode(data);
            return Future.success(schedulerExecutionInfo);
        });
    }
}
