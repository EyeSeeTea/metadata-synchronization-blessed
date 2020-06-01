import { MetadataImportResponse, MetadataPackage, MetadataImportParams } from "./MetadataEntities";
import Instance from "../instance/Instance";

export interface MetadataRepository {
    save(
        metadata: MetadataPackage,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance
    ): Promise<MetadataImportResponse>;
}
