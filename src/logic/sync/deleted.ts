import memoize from "nano-memoize";
import Instance from "../../models/instance";
import {
    cleanMetadataImportResponse,
    getMetadata,
    postMetadata,
} from "../../utils/synchronization";
import { GenericSync, SyncronizationPayload } from "./generic";

export class DeletedSync extends GenericSync {
    public readonly type = "deleted";

    public buildPayload = memoize(async () => {
        return {};
    });

    public async postPayload(instance: Instance) {
        const { metadataIds, syncParams = {} } = this.builder;

        const payloadPackage = await getMetadata(instance.getApi(), metadataIds, "id");
        console.debug("Metadata package", payloadPackage);

        const response = await postMetadata(instance.getApi(), payloadPackage, {
            ...syncParams,
            importStrategy: "DELETE",
        });

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
