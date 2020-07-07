import memoize from "nano-memoize";
import { Ref } from "../../common/entities/Ref";
import { Instance } from "../../instance/entities/Instance";
import {
    GenericSyncUseCase,
    SyncronizationPayload,
} from "../../synchronization/usecases/GenericSyncUseCase";

export class DeletedMetadataSyncUseCase extends GenericSyncUseCase {
    public readonly type = "deleted";

    public buildPayload = memoize(async () => {
        return {};
    });

    public async postPayload(instance: Instance) {
        const { metadataIds, syncParams = {} } = this.builder;

        const payloadPackage = await this.getMetadataRepository(instance).getMetadataByIds<Ref>(
            metadataIds,
            "id"
        );

        console.debug("Metadata package", payloadPackage);

        const syncResult = await this.getMetadataRepository(instance).remove(
            payloadPackage,
            syncParams
        );

        return [syncResult];
    }

    public async buildDataStats() {
        return undefined;
    }

    public async mapPayload(
        _instance: Instance,
        payload: SyncronizationPayload
    ): Promise<SyncronizationPayload> {
        return payload;
    }
}
