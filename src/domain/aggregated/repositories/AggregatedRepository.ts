import Instance, { MetadataMappingDictionary } from "../../../models/instance";
import { DataImportParams } from "../../../types/d2";
import { D2CategoryOptionCombo } from "../../../types/d2-api";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { MappedCategoryOption } from "../entities/MappedCategoryOption";
import { DataSynchronizationParams } from "../types";

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
    ): Promise<MappedCategoryOption[]>;

    getDimensions(): Promise<string[]>;

    save(
        data: object,
        additionalParams: DataImportParams | undefined,
        targetInstance: Instance
    ): Promise<SynchronizationResult>;
}
