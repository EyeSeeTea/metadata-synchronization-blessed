import { D2ModelSchemas } from "../../../types/d2-api";
import { Id } from "../../common/entities/Schemas";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import {
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

    listMetadata(params: ListMetadataParams): Promise<ListMetadataResponse>;
    listAllMetadata(params: ListMetadataParams): Promise<MetadataEntity[]>;

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

export interface ListMetadataParams {
    type: keyof D2ModelSchemas;
    fields?: object;
    group?: { type: string; value: string };
    level?: string;
    search?: { field: string; operator: string; value: string };
    order?: { field: string; order: "asc" | "desc" };
    page?: number;
    pageSize?: number;
    paging?: false;
    lastUpdated?: Date;
    parents?: string[];
    filterRows?: string[];
    showOnlySelected?: boolean;
    selectedIds?: string[];
}

export interface ListMetadataResponse {
    objects: MetadataEntity[];
    pager: {
        pageSize: number;
        total: number;
        page: number;
    };
}
