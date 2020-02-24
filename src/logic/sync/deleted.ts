import memoize from "nano-memoize";
import Instance from "../../models/instance";
import { MetadataImportResponse } from "../../types/d2";
import {
    cleanMetadataImportResponse,
    getMetadata,
    postMetadata,
} from "../../utils/synchronization";
import { GenericSync, SyncronizationPayload } from "./generic";

export class DeletedSync extends GenericSync {
    protected readonly type = "deleted";

    public buildPayload = memoize(async () => {
        const { metadataIds } = this.builder;
        return getMetadata(this.api, metadataIds, "id");
    });

    protected async postPayload(instance: Instance) {
        const { syncParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();
        console.debug("Metadata package", payloadPackage);

        return postMetadata(instance.getApi(), payloadPackage, {
            ...syncParams,
            importStrategy: "DELETE",
        });
    }

    protected cleanResponse(response: MetadataImportResponse, instance: Instance) {
        return cleanMetadataImportResponse(response, instance);
    }

    protected async buildDataStats() {
        return undefined;
    }

    protected async mapMetadata(
        _instance: Instance,
        payload: SyncronizationPayload
    ): Promise<SyncronizationPayload> {
        return payload;
    }
}
