import { DataImportParams } from "../../../types/d2";
import { DataSynchronizationParams } from "../../aggregated/types";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";

export interface TrackedEntityInstanceRepositoryConstructor {
    new (instance: Instance): TrackedEntityInstanceRepository;
}

export interface TrackedEntityInstanceRepository {
    get(
        params: DataSynchronizationParams,
        program: string[],
        orgUnits?: string[]
    ): Promise<TrackedEntityInstance[]>;

    save(
        data: TrackedEntityInstance[],
        additionalParams: DataImportParams | undefined
    ): Promise<SynchronizationResult>;
}
