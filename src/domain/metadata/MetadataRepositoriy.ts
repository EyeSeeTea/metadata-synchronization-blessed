import { MetadataImportResponse, MetadataImportParams } from "./Types";
import Instance from "../instance/Instance";
import { Id } from "../common/Entities";
import { MetadataPackage, MetadataFieldsPackage } from "./entities";

export interface MetadataRepository {
    getMetadataFieldsByIds<T>(ids: Id[], fields: string): Promise<MetadataFieldsPackage<T>>;

    getMetadataByIds(ids: Id[]): Promise<MetadataPackage>;

    save(metadata: MetadataPackage,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance): Promise<MetadataImportResponse>;
}