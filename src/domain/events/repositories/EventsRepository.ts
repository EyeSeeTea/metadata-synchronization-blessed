import { DataSynchronizationParams } from "../../aggregated/types";
import { ProgramEvent } from "../entities/Events";
import { DataImportParams, DataImportResponse } from "../../../types/d2";

export interface EventsRepository {
    getEvents(
        params: DataSynchronizationParams,
        programs?: string[],
        defaults?: string[]
    ): Promise<ProgramEvent[]>;

    save(data: object, additionalParams?: DataImportParams): Promise<DataImportResponse>;
}
