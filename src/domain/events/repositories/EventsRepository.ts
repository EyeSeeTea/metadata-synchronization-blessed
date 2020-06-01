import { DataSynchronizationParams } from "../../aggregated/types";
import { ProgramEvent } from "../entities/ProgramEvent";
import { DataImportParams, DataImportResponse } from "../../../types/d2";

export interface EventsRepository {
    getEvents(
        params: DataSynchronizationParams,
        programs?: string[],
        defaults?: string[]
    ): Promise<ProgramEvent[]>;

    save(data: object, additionalParams?: DataImportParams): Promise<DataImportResponse>;
}
