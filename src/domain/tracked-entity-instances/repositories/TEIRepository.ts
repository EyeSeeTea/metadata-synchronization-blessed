import { DataImportParams, DataSynchronizationParams } from "../../aggregated/entities/DataSynchronizationParams";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { TEIsPackage } from "../entities/TEIsPackage";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";

export interface TEIRepositoryConstructor {
    new (instance: Instance): TEIRepository;
}

export interface TEIRepository {
    getTEIs(params: DataSynchronizationParams, program: string, page: number, pageSize: number): Promise<TEIsResponse>;
    getTEIsById(params: DataSynchronizationParams, ids: string[]): Promise<TrackedEntityInstance[]>;

    save(data: TEIsPackage, additionalParams: DataImportParams | undefined): Promise<SynchronizationResult>;
}

export interface TEIsResponse {
    trackedEntityInstances: TrackedEntityInstance[];
    pager: {
        pageSize: number;
        total: number;
        page: number;
    };
}
