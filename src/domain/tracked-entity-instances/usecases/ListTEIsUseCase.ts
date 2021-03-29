import { DataSynchronizationParams } from "../../aggregated/types";
import { UseCase } from "../../common/entities/UseCase";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";
import { TEIRepository } from "../repositories/TEIRepository";

export class ListTEIsUseCase implements UseCase {
    constructor(private trackedEntityInstanceRepository: TEIRepository) {}

    public async execute(
        params: DataSynchronizationParams,
        programs: string
    ): Promise<TrackedEntityInstance[]> {
        return this.trackedEntityInstanceRepository.getTEIs(params, programs);
    }
}
