import memoize from "nano-memoize";
import InstanceEntity from "../../instance/Instance";
import { MetadataRepository } from "../MetadataRepositoriy";
import MetadataD2ApiRepository from "../../../data/metadata/repositories/MetadataD2ApiRepository";
import { cleanMetadataImportResponse } from "../utils";
import { Ref } from "../../common/entities";

//TODO: Uncouple this dependencies. This class should be moved to domain
// and It should have not any dependency outside from the domain
import { GenericSync, SyncronizationPayload } from "../../../logic/sync/generic";
import Instance from "../../../models/instance";
import { D2 } from "../../../types/d2";
import { D2Api } from "../../../types/d2-api";
import { SynchronizationBuilder } from "../../../types/synchronization";

export class DeletedMetadataSyncUseCase extends GenericSync {
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
        //TODO: remove instance from abstract method in base base class 
        // when aggregated and events does not use 
        console.log(instance.url);

        const { metadataIds, syncParams = {} } = this.builder;

        const payloadPackage = await this.metadataRepository.getMetadataFieldsByIds<Ref>(metadataIds, "id", instanceEntity);

        console.debug("Metadata package", payloadPackage);

        const response = await this.metadataRepository.remove(payloadPackage, syncParams, instanceEntity);

        const syncResult = cleanMetadataImportResponse(response, instanceEntity, this.type);
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
