import { SynchronizationPayload } from "../entities/SynchronizationPayload";

export interface PackageMapper {
    map: (payload: SynchronizationPayload) => Promise<SynchronizationPayload>;
}
