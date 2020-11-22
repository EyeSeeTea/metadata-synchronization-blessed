import { DataImportParams } from "../../../types/d2";
import { Instance } from "../../instance/entities/Instance";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { CategoryOptionCombo } from "../../metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { MappedCategoryOption } from "../entities/MappedCategoryOption";
import { DataSynchronizationParams } from "../types";

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

    save(
        data: object,
        additionalParams: DataImportParams | undefined
    ): Promise<SynchronizationResult>;
}
