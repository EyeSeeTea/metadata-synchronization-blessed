import { DataImportParams, DataSynchronizationParams } from "../../aggregated/entities/DataSynchronizationParams";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { ProgramEvent } from "../entities/ProgramEvent";

export interface EventsRepository {
    getEvents(
        params: DataSynchronizationParams,
        programStageIds?: string[],
        defaults?: string[]
    ): Promise<ProgramEvent[]>;

    save(data: object, additionalParams: DataImportParams | undefined): Promise<SynchronizationResult>;

    getEventFile(eventId: string, dataElement: string, fileResourceId: string): Promise<File>;
}
