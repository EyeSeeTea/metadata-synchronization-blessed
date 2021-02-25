import { DataSynchronizationParams } from "../../aggregated/types";
import { Instance } from "../../instance/entities/Instance";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";

export interface TEIRepositoryConstructor {
    new (instance: Instance): TEIRepository;
}

export interface TEIRepository {
    getTEIs(params: DataSynchronizationParams, program: string): Promise<TrackedEntityInstance[]>;

    // save(
    //     data: TrackedEntityInstance[],
    //     additionalParams: DataImportParams | undefined
    // ): Promise<SynchronizationResult>;
}
