import { Future, FutureData } from "../../domain/common/entities/Future";
import { SchedulerExecutionInfo } from "../../domain/scheduler/entities/SchedulerExecutionInfo";
import { SchedulerExecutionInfoRepository } from "../../domain/scheduler/repositories/SchedulerExecutionInfoRepositoryConstructor";
import { Namespace } from "../storage/Namespaces";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
import { SchedulerExecutionInfoModel } from "./models/SchedulerExecutionInfoModel";

/**
 * @description This file is refactored
 */
export class SchedulerExecutionInfoD2ApiRepository implements SchedulerExecutionInfoRepository {
    constructor(private dataStoreClient: StorageDataStoreClient) {}

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
