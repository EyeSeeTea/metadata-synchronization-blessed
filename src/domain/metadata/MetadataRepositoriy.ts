import { MetadataImportResponse, MetadataImportParams } from "./types";
import Instance from "../instance/Instance";
import { Id } from "../common/entities";
import { MetadataPackage, MetadataFieldsPackage, MetadataEntities, MetadataEntity } from "./entities";

export interface MetadataRepository {
    getMetadataFieldsByIds<T>(ids: Id[], fields: string, targetInstance?: Instance): Promise<MetadataFieldsPackage<T>>;

    getMetadataByIds(ids: Id[]): Promise<MetadataPackage>;

    getMetadataByType(type: keyof MetadataEntities): Promise<MetadataEntity[]>;

    save(metadata: MetadataPackage,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance): Promise<MetadataImportResponse>;

    remove(metadata: MetadataFieldsPackage<{ id: Id }>,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance): Promise<MetadataImportResponse>;
}