import { MetadataMappingDictionary } from "../../../models/instance";
import { D2CategoryOptionCombo } from "../../../types/d2-api";
import { CategoryOptionAggregationBuilder } from "../../../types/synchronization";
import { AggregatedPackage } from "../entities/Aggregated";
import { DataSynchronizationParams } from "../types";
import { DataImportParams, DataImportResponse } from "../../../types/d2";

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
        categoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): Promise<CategoryOptionAggregationBuilder[]>;

    getDimensions(): Promise<string[]>;

    save(data: object, additionalParams?: DataImportParams): Promise<DataImportResponse>;
}
