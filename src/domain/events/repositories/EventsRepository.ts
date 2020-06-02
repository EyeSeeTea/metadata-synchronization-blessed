import Instance from "../../../models/instance";
import { DataImportParams } from "../../../types/d2";
import { DataSynchronizationParams } from "../../aggregated/types";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { ProgramEvent } from "../entities/ProgramEvent";

export interface EventsRepository {
    getEvents(
        params: DataSynchronizationParams,
        programs?: string[],
        defaults?: string[]
    ): Promise<ProgramEvent[]>;

    save(
        data: object,
        additionalParams: DataImportParams | undefined,
        targetInstance: Instance
    ): Promise<SynchronizationResult>;
}
