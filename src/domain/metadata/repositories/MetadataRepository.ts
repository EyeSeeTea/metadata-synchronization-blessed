import { Id } from "../../common/entities/Schemas";
import Instance from "../../instance/Instance";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import {
    MetadataEntities,
    MetadataEntity,
    MetadataFieldsPackage,
    MetadataPackage,
} from "../entities/MetadataEntities";
import { MetadataImportParams } from "../types";

export interface MetadataRepository {
    getMetadataFieldsByIds<T>(
        ids: Id[],
        fields: string,
        targetInstance?: Instance
    ): Promise<MetadataFieldsPackage<T>>;

    getMetadataByIds(ids: Id[]): Promise<MetadataPackage>;

    getMetadataByType(type: keyof MetadataEntities): Promise<MetadataEntity[]>;

    save(
        metadata: MetadataPackage,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance
    ): Promise<SynchronizationResult>;

    remove(
        metadata: MetadataFieldsPackage<{ id: Id }>,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance
    ): Promise<SynchronizationResult>;
}
