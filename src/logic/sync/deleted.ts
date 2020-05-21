import memoize from "nano-memoize";
import Instance from "../../models/instance";
import InstanceEntity from "../../domain/instance/Instance";
import {
    cleanMetadataImportResponse,
    getMetadata
} from "../../utils/synchronization";
import { GenericSync, SyncronizationPayload } from "./generic";
import { MetadataRepository } from "../../domain/synchronization/MetadataRepositoriy";
import { D2 } from "../../types/d2";
import { D2Api } from "../../types/d2-api";
import { SynchronizationBuilder } from "../../types/synchronization";
import MetadataD2ApiRepository from "../../data/synchronization/repositories/MetadataD2ApiRepository";

export class DeletedSync extends GenericSync {
    public readonly type = "deleted";

    private metadataRepository: MetadataRepository

    constructor(d2: D2, api: D2Api, builder: SynchronizationBuilder) {
        super(d2, api, builder)

        //TODO: composition root - This dependency should be injected by constructor when we have
        // composition root
        this.metadataRepository = new MetadataD2ApiRepository(api);
    }

    public buildPayload = memoize(async () => {
        return {};
    });

    public async postPayload(instance: Instance, instanceEntity: InstanceEntity) {
        const { metadataIds, syncParams = {} } = this.builder;

        const payloadPackage = await getMetadata(instance.getApi(), metadataIds, "id");

        console.debug("Metadata package", payloadPackage);

        const response = await this.metadataRepository.save(payloadPackage, {
            ...syncParams,
            importStrategy: "DELETE",
        }, instanceEntity);

        const syncResult = cleanMetadataImportResponse(response, instance, this.type);
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
