import memoize from "nano-memoize";
import { Ref } from "../../common/entities/Ref";
import { Instance } from "../../instance/entities/Instance";
import {
    GenericSyncUseCase,
    SynchronizationPayload,
} from "../../synchronization/usecases/GenericSyncUseCase";
import { debug } from "../../../utils/debug";

export class DeletedMetadataSyncUseCase extends GenericSyncUseCase {
    public readonly type = "deleted";

    public buildPayload = memoize(async () => {
        return {};
    });

    public async postPayload(instance: Instance) {
        const { metadataIds, syncParams = {} } = this.builder;
        const remoteMetadataRepository = await this.getMetadataRepository(instance);

        const payloadPackage = await remoteMetadataRepository.getMetadataByIds<Ref>(
            metadataIds,
            "id"
        );

        debug("Metadata package", payloadPackage);

        const syncResult = await remoteMetadataRepository.remove(payloadPackage, syncParams);
        const origin = await this.getOriginInstance();

        return [{ result: { ...syncResult, origin: origin.toPublicObject() } }];
    }

    public async buildDataStats() {
        return undefined;
    }

    public async mapPayload(
        _instance: Instance,
        payload: SynchronizationPayload
    ): Promise<SynchronizationPayload> {
        return payload;
    }
}
