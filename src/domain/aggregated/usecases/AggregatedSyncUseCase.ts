import _ from "lodash";
import memoize from "nano-memoize";
import { debug } from "../../../utils/debug";
import { Instance } from "../../instance/entities/Instance";
import {
    DataElement,
    DataElementGroup,
    DataElementGroupSet,
    DataSet,
    Indicator,
    ProgramIndicator,
} from "../../metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import { buildMetadataDictionary } from "../../synchronization/utils";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { createAggregatedPayloadMapper } from "../mapper/AggregatedPayloadMapperFactory";
import { getMinimumParents } from "../utils";

export class AggregatedSyncUseCase extends GenericSyncUseCase {
    public readonly type = "aggregated";
    public readonly fields =
        "id,dataElements[id,name],dataSetElements[:all,dataElement[id,name]],dataElementGroups[id,dataElements[id,name]],name";

    public buildPayload = memoize(async (remoteInstance?: Instance) => {
        const { dataParams: { enableAggregation = false } = {} } = this.builder;

        if (enableAggregation) {
            return this.buildAnalyticsPayload(remoteInstance);
        } else {
            return this.buildNormalPayload(remoteInstance);
        }
    });

    private buildNormalPayload = async (remoteInstance?: Instance) => {
        const { dataParams = {}, excludedIds = [] } = this.builder;
        const aggregatedRepository = await this.getAggregatedRepository(remoteInstance);

        const { dataSets = [] } = await this.extractMetadata<DataSet>(remoteInstance);
        const { dataElementGroups = [] } = await this.extractMetadata<DataElementGroup>(remoteInstance);
        const { dataElementGroupSets = [] } = await this.extractMetadata<DataElementGroupSet>(remoteInstance);
        const { dataElements = [] } = await this.extractMetadata<DataElement>(remoteInstance);

        const dataSetIds = dataSets.map(({ id }) => id);
        const dataElementGroupIds = dataElementGroups.map(({ id }) => id);
        const dataElementGroupSetIds = dataElementGroupSets.map(({ dataElementGroups }) =>
            dataElementGroups.map(({ id }) => id)
        );

        // Retrieve direct data values from dataSets and dataElementGroups
        const { dataValues: directDataValues = [] } = await aggregatedRepository.getAggregated(
            dataParams,
            dataSetIds,
            _([...dataElementGroupIds, ...dataElementGroupSetIds])
                .flatten()
                .uniq()
                .value()
        );

        // Retrieve candidate data values from dataElements
        const dataSetIdsFromDataElements = getMinimumParents(
            new Map(dataElements.map(de => [de.id, de.dataSetElements.map(dse => dse.dataSet.id)]))
        );

        const dataElementGroupIdsFromDataElements = getMinimumParents(
            new Map(dataElements.map(de => [de.id, de.dataElementGroups.map(deg => deg.id)]))
        );

        const { dataValues: candidateDataValues = [] } = await aggregatedRepository.getAggregated(
            dataParams,
            dataSetIdsFromDataElements,
            dataElementGroupIdsFromDataElements
        );

        // Retrieve indirect data values from dataElements
        const indirectDataValues = _.filter(
            candidateDataValues,
            ({ dataElement }) => !!_.find(dataElements, { id: dataElement })
        );

        const dataValues = [...directDataValues, ...indirectDataValues].filter(
            ({ dataElement }) => !excludedIds.includes(dataElement)
        );

        return { dataValues };
    };

    private buildAnalyticsPayload = async (remoteInstance?: Instance) => {
        const { dataParams = {}, excludedIds = [] } = this.builder;

        // TODO: All these extract metadata methods can be combined if properly typed
        const { dataSets = [] } = await this.extractMetadata<DataSet>(remoteInstance);
        const { dataElementGroups = [] } = await this.extractMetadata<DataElementGroup>(remoteInstance);
        const { dataElementGroupSets = [] } = await this.extractMetadata<DataElementGroupSet>(remoteInstance);
        const { dataElements = [] } = await this.extractMetadata<DataElement>(remoteInstance);
        const { indicators = [] } = await this.extractMetadata<Indicator>(remoteInstance);
        const { programIndicators = [] } = await this.extractMetadata<ProgramIndicator>(remoteInstance);

        const dataElementIds = dataElements.map(({ id }) => id);
        const indicatorIds = [...indicators, ...programIndicators].map(({ id }) => id);
        const dataSetIds = _.flatten(
            dataSets.map(({ dataSetElements }) => dataSetElements.map(({ dataElement }) => dataElement.id))
        );
        const dataElementGroupIds = _.flatten(
            dataElementGroups.map(({ dataElements }) => dataElements.map(({ id }) => id))
        );
        const dataElementGroupSetIds = _.flatten(
            dataElementGroupSets.map(({ dataElementGroups }) =>
                _.flatten(dataElementGroups.map(({ dataElements }) => dataElements.map(({ id }) => id)))
            )
        );

        const aggregatedRepository = await this.getAggregatedRepository(remoteInstance);

        const { dataValues: dataElementValues = [] } = await aggregatedRepository.getAnalytics({
            dataParams,
            dimensionIds: [...dataElementIds, ...dataSetIds, ...dataElementGroupIds, ...dataElementGroupSetIds],
            includeCategories: true,
        });

        const { dataValues: indicatorValues = [] } = await aggregatedRepository.getAnalytics({
            dataParams,
            dimensionIds: indicatorIds,
            includeCategories: false,
        });

        const dataValues = [...dataElementValues, ...indicatorValues].filter(
            ({ dataElement }) => !excludedIds.includes(dataElement)
        );

        return { dataValues };
    };

    public async postPayload(instance: Instance): Promise<SynchronizationResult[]> {
        const { dataParams = {} } = this.builder;

        const originalPayload = await this.buildPayload();
        const mappedPayload = await this.mapPayload(instance, originalPayload);

        const existingPayload = dataParams.ignoreDuplicateExistingValues
            ? await this.mapPayload(instance, await this.buildPayload(instance))
            : { dataValues: [] };

        const payload = this.filterPayload(mappedPayload, existingPayload);
        debug("Aggregated package", {
            originalPayload,
            mappedPayload,
            existingPayload,
            payload,
        });

        const aggregatedRepository = await this.getAggregatedRepository(instance);
        const syncResult = await aggregatedRepository.save(payload, dataParams);
        const origin = await this.getOriginInstance();

        return [{ ...syncResult, origin: origin.toPublicObject(), payload }];
    }

    public async buildDataStats() {
        const metadataPackage = await this.extractMetadata();
        const dictionary = buildMetadataDictionary(metadataPackage);
        const { dataValues } = await this.buildPayload();

        return _(dataValues)
            .groupBy("dataElement")
            .mapValues((array, dataElement) => ({
                dataElement: dictionary[dataElement]?.name ?? dataElement,
                count: array.length,
            }))
            .values()
            .value();
    }

    public async mapPayload(instance: Instance, payload: AggregatedPackage): Promise<AggregatedPackage> {
        // TODO: when we have mappers for all cases, this method should be removed in base class and use the mappers
        const metadataRepository = await this.getMetadataRepository();
        const remoteMetadataRepository = await this.getMetadataRepository(instance);
        const aggregatedRepository = await this.getAggregatedRepository();
        const mapping = await this.getMapping(instance);
        const { dataParams = {} } = this.builder;

        const eventMapper = await createAggregatedPayloadMapper(
            metadataRepository,
            remoteMetadataRepository,
            aggregatedRepository,
            mapping,
            dataParams
        );

        return (await eventMapper.map(payload)) as AggregatedPackage;
    }

    public filterPayload(payload: AggregatedPackage, filter: AggregatedPackage): AggregatedPackage {
        const dataValues = _.differenceBy(
            payload.dataValues ?? [],
            filter.dataValues ?? [],
            ({ dataElement, period, orgUnit, categoryOptionCombo, attributeOptionCombo, value }) =>
                [
                    dataElement,
                    period,
                    orgUnit,
                    categoryOptionCombo ?? "default",
                    attributeOptionCombo ?? "default",
                    value,
                ].join("-")
        );

        return { dataValues };
    }
}
