import { SynchronizationPayload } from "../entities/SynchronizationPayload";

export interface PayloadMapper {
    map: (payload: SynchronizationPayload) => Promise<SynchronizationPayload>;
}
