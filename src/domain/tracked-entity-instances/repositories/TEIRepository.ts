import { DataImportParams, DataSynchronizationParams } from "../../aggregated/entities/DataSynchronizationParams";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { TEIsPackage } from "../entities/TEIsPackage";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";

export interface TEIRepository {
    getAllTEIs(params: DataSynchronizationParams, programs: string[]): Promise<TrackedEntityInstance[]>;
    getTEIs(params: DataSynchronizationParams, program: string, page: number, pageSize: number): Promise<TEIsResponse>;
    getTEIsById(params: DataSynchronizationParams, ids: string[]): Promise<TrackedEntityInstance[]>;

    save(data: TEIsPackage, additionalParams: DataImportParams | undefined): Promise<SynchronizationResult>;
}

export interface TEIsResponse {
    page: number;
    total: number;
    pageCount: number;
    pageSize: number;
    instances: TrackedEntityInstance[];
}
