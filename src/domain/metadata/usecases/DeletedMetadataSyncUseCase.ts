import memoize from "nano-memoize";
import Instance from "../../../models/instance";
import { D2 } from "../../../types/d2";
import { SynchronizationBuilder } from "../../../types/synchronization";
import { Ref } from "../../common/entities/Ref";
import { Instance as InstanceEntity } from "../../instance/entities/Instance";
import { InstanceRepository } from "../../instance/repositories/InstanceRepository";
import {
    GenericSyncUseCase,
    SyncronizationPayload,
} from "../../synchronization/usecases/GenericSyncUseCase";
import { MetadataRepository } from "../repositories/MetadataRepository";

export class DeletedMetadataSyncUseCase extends GenericSyncUseCase {
    public readonly type = "deleted";

    constructor(
        d2: D2,
        instance: InstanceEntity,
        builder: SynchronizationBuilder,
        instanceRepository: InstanceRepository,
        private metadataRepository: MetadataRepository
    ) {
        super(d2, instance, builder, instanceRepository);
    }

    public buildPayload = memoize(async () => {
        return {};
    });

    public async postPayload(_instance: Instance, instanceEntity: InstanceEntity) {
        const { metadataIds, syncParams = {} } = this.builder;

        const payloadPackage = await this.metadataRepository.getMetadataByIds<Ref>(
            metadataIds,
            "id",
            instanceEntity
        );

        console.debug("Metadata package", payloadPackage);

        const syncResult = await this.metadataRepository.remove(
            payloadPackage,
            syncParams,
            instanceEntity
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
