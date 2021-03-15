import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { PayloadMapper } from "../../synchronization/mapper/PayloadMapper";

export class TEIsPayloadMapper implements PayloadMapper {
    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        return Promise.resolve(payload);
    }
}
