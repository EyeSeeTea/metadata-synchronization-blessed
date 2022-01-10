import { FilterSingleOperatorBase } from "@eyeseetea/d2-api/api/common";
import { IdentifiableRef, Ref } from "../../common/entities/Ref";
import { Id } from "../../common/entities/Schemas";
import { DataSource } from "../../instance/entities/DataSource";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { TransformationRepository } from "../../transformations/repositories/TransformationRepository";
import { FilterRule } from "../entities/FilterRule";
import { CategoryOptionCombo, MetadataEntities, MetadataEntity, MetadataPackage } from "../entities/MetadataEntities";
import { MetadataImportParams } from "../entities/MetadataSynchronizationParams";

export interface MetadataRepositoryConstructor {
    new (instance: DataSource, transformationRepository: TransformationRepository): MetadataRepository;
}

export interface MetadataRepository {
    getMetadataByIds<T>(ids: Id[], fields?: object | string, includeDefaults?: boolean): Promise<MetadataPackage<T>>;
    getByFilterRules(filterRules: FilterRule[]): Promise<Id[]>;
    getDefaultIds(filter?: string): Promise<string[]>;
    getCategoryOptionCombos(): Promise<
        Pick<CategoryOptionCombo, "id" | "name" | "categoryCombo" | "categoryOptions">[]
    >;

    listMetadata(params: ListMetadataParams): Promise<ListMetadataResponse>;
    listAllMetadata(params: ListMetadataParams): Promise<MetadataEntity[]>;
    lookupSimilar(query: IdentifiableRef): Promise<MetadataPackage<IdentifiableRef>>;

    save(metadata: MetadataPackage, additionalParams?: MetadataImportParams): Promise<SynchronizationResult>;

    remove(metadata: MetadataPackage<Ref>, additionalParams?: MetadataImportParams): Promise<SynchronizationResult>;
}

export interface ListMetadataParams {
    type: keyof MetadataEntities;
    fields?: object;
    group?: { type: string; value: string };
    level?: string;
    program?: string;
    domainType?: string;
    optionSet?: string;
    category?: string;
    includeParents?: boolean;
    search?: { field: string; operator: FilterSingleOperatorBase; value: string };
    order?: { field: string; order: "asc" | "desc" };
    page?: number;
    pageSize?: number;
    paging?: boolean;
    lastUpdated?: Date;
    parents?: string[];
    filterRows?: string[];
    showOnlySelected?: boolean;
    disableFilterRows?: boolean;
    selectedIds?: string[];
    rootJunction?: "AND" | "OR";
    programType?: "WITHOUT_REGISTRATION" | "WITH_REGISTRATION";
    childrenPropInList?: { prop: string; values: string[] };
}

export interface ListMetadataResponse {
    objects: MetadataEntity[];
    pager: {
        pageSize: number;
        total: number;
        page: number;
    };
}
