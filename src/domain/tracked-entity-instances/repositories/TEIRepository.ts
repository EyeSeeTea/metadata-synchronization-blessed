import { DataImportParams } from "../../../types/d2";
import { DataSynchronizationParams } from "../../aggregated/types";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { TEIsPackage } from "../entities/TEIsPackage";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";

export interface TEIRepositoryConstructor {
    new (instance: Instance): TEIRepository;
}

export interface TEIRepository {
    getTEIs(params: DataSynchronizationParams, program: string): Promise<TrackedEntityInstance[]>;
    getTEIsById(params: DataSynchronizationParams, ids: string[]): Promise<TrackedEntityInstance[]>;

    save(
        data: TEIsPackage,
        additionalParams: DataImportParams | undefined
    ): Promise<SynchronizationResult>;
}
