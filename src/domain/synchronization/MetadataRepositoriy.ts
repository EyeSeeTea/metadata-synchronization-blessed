import { MetadataImportResponse, MetadataImportParams } from "./MetadataEntities";
import Instance from "../instance/Instance";
import { MetadataPackage } from "../metadata/entities";

export interface MetadataRepository {
    save(metadata: MetadataPackage,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance): Promise<MetadataImportResponse>;
}