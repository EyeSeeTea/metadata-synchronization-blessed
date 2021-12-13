import _ from "lodash";
import { promiseMap } from "../../../utils/common";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { CategoryOptionCombo } from "../../metadata/entities/MetadataEntities";
import { MetadataRepository } from "../../metadata/repositories/MetadataRepository";
import { DataSynchronizationParams } from "../entities/DataSynchronizationParams";
import { DataValue } from "../entities/DataValue";
import { AggregatedRepository } from "../repositories/AggregatedRepository";
import { AggregatedPayloadMapper } from "./AggregatedPayloadMapper";

export async function createAggregatedPayloadMapper(
    metadataRepository: MetadataRepository,
    remoteMetadataRepository: MetadataRepository,
    aggregatedRepository: AggregatedRepository,
    mapping: MetadataMappingDictionary,
    dataParams: DataSynchronizationParams
) {
    const originCategoryOptionCombos = await metadataRepository.getCategoryOptionCombos();
    const destinationCategoryOptionCombos = await remoteMetadataRepository.getCategoryOptionCombos();
    const defaultCategoryOptionCombos = await metadataRepository.getDefaultIds();

    const instanceAggregatedValues = await buildInstanceAggregation(
        aggregatedRepository,
        mapping,
        destinationCategoryOptionCombos,
        dataParams
    );

    return new AggregatedPayloadMapper(
        mapping,
        originCategoryOptionCombos,
        destinationCategoryOptionCombos,
        defaultCategoryOptionCombos,
        instanceAggregatedValues
    );
}

async function buildInstanceAggregation(
    aggregatedRepository: AggregatedRepository,
    mapping: MetadataMappingDictionary,
    categoryOptionCombos: Partial<CategoryOptionCombo>[],
    dataParams: DataSynchronizationParams
): Promise<DataValue[]> {
    // This instance aggregated data value logic is unclear, but we keep it for historical
    // the original commit where this logic was created is this.
    // b8c4f063e84f44403ae4657bb1fe66c4829cb647

    const { enableAggregation = false } = dataParams;
    if (!enableAggregation) return [];

    const result = await promiseMap(
        await aggregatedRepository.getOptions(mapping, categoryOptionCombos),
        async ({ dataElement, categoryOptions, mappedOptionCombo }) => {
            const { dataValues = [] } = await aggregatedRepository.getAnalytics({
                dataParams,
                dimensionIds: [dataElement],
                includeCategories: false,
                filter: categoryOptions.map(id => id.replace("-", ":")),
            });

            return dataValues.map(dataValue => ({
                ...dataValue,
                categoryOptionCombo: mappedOptionCombo,
            }));
        }
    );

    return _.flatten(result);
}
