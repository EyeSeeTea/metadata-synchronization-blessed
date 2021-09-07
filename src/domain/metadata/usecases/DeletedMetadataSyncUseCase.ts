import memoize from "nano-memoize";
import { debug } from "../../../utils/debug";
import { Ref } from "../../common/entities/Ref";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";

export class DeletedMetadataSyncUseCase extends GenericSyncUseCase {
    public readonly type = "deleted";

    public buildPayload = memoize(async () => {
        return {};
    });

    public async postPayload(instance: Instance) {
        const { metadataIds, syncParams = {} } = this.builder;
        const remoteMetadataRepository = await this.getMetadataRepository(instance);

        const payload = await remoteMetadataRepository.getMetadataByIds<Ref>(metadataIds, "id");

        debug("Metadata package", payload);

        const syncResult = await remoteMetadataRepository.remove(payload, syncParams);
        const origin = await this.getOriginInstance();

        return [{ ...syncResult, origin: origin.toPublicObject() }];
    }

    public async buildDataStats() {
        return undefined;
    }

    public async mapPayload(_instance: Instance, payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        return payload;
    }
}
