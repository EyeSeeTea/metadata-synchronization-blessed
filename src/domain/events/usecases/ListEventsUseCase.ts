import { DataSynchronizationParams } from "../../aggregated/types";
import { UseCase } from "../../common/entities/UseCase";
import { ProgramEvent } from "../entities/ProgramEvent";
import { EventsRepository } from "../repositories/EventsRepository";

export class ListEventsUseCase implements UseCase {
    constructor(private eventsRepository: EventsRepository) {}

    public async execute(
        params: DataSynchronizationParams,
        programs: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        return this.eventsRepository.getEvents(params, programs, defaults);
    }
}
