import { DataImportParams, DataSynchronizationParams } from "../../aggregated/entities/DataSynchronizationParams";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { ProgramEvent } from "../entities/ProgramEvent";

export interface EventsRepositoryConstructor {
    new (instance: Instance): EventsRepository;
}

export interface EventsRepository {
    getEvents(
        params: DataSynchronizationParams,
        programStageIds?: string[],
        defaults?: string[]
    ): Promise<ProgramEvent[]>;

    save(data: object, additionalParams: DataImportParams | undefined): Promise<SynchronizationResult>;
}
