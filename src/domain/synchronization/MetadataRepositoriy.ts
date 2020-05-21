import { MetadataImportResponse, MetadataImportParams } from "./MetadataEntities";
import Instance from "../instance/Instance";
import { Id } from "../common/Entities";
import { MetadataPackage, MetadataFieldsPackage } from "../metadata/entities";

export interface MetadataRepository {
    getMetadataFieldsByIds<T>(ids: Id[], fields: string): Promise<MetadataFieldsPackage<T>>;

    getMetadataByIds(ids: Id[]): Promise<MetadataPackage>;

    save(metadata: MetadataPackage,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance): Promise<MetadataImportResponse>;
}