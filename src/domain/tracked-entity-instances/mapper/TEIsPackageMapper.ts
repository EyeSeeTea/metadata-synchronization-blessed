import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { PackageMapper } from "../../synchronization/mapper/PackageMapper";

export class TEIPackageMapper implements PackageMapper {
    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        return Promise.resolve(payload);
    }
}
