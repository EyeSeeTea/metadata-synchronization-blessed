import { Instance } from "../../instance/entities/Instance";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { CategoryOptionCombo } from "../../metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { DataImportParams, DataSynchronizationParams } from "../entities/DataSynchronizationParams";
import { MappedCategoryOption } from "../entities/MappedCategoryOption";

export interface AggregatedRepositoryConstructor {
    new (instance: Instance): AggregatedRepository;
}

export interface AggregatedRepository {
    getAggregated(
        params: DataSynchronizationParams,
        dataSet: string[],
        dataElementGroup: string[]
    ): Promise<AggregatedPackage>;

    getAnalytics(params: {
        dataParams: DataSynchronizationParams;
        dimensionIds: string[];
        filter?: string[];
        includeCategories: boolean;
    }): Promise<AggregatedPackage>;

    getOptions(
        { aggregatedDataElements }: MetadataMappingDictionary,
        categoryOptionCombos: Partial<CategoryOptionCombo>[]
    ): Promise<MappedCategoryOption[]>;

    getDimensions(): Promise<string[]>;

    save(data: AggregatedPackage, additionalParams?: DataImportParams): Promise<SynchronizationResult>;

    delete(data: AggregatedPackage): Promise<SynchronizationResult>;
}
