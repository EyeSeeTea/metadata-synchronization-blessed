import { DataSynchronizationParams } from "../../aggregated/entities/DataSynchronizationParams";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { ProgramEvent } from "../entities/ProgramEvent";

export class ListEventsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, protected localInstance: Instance) {}

    public async execute(
        instance: Instance,
        params: DataSynchronizationParams,
        programStageIds: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        return this.repositoryFactory.eventsRepository(instance).getEvents(params, programStageIds, defaults);
    }
}
