import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationBuilder } from "../../synchronization/entities/SynchronizationBuilder";

import { cache } from "../../../utils/cache";
import {
    DataElement,
    DataElementGroup,
    DataElementGroupSet,
    DataSet,
    Indicator,
    MetadataPackage,
    ProgramIndicator,
} from "../../metadata/entities/MetadataEntities";
import { DataStoreMetadata } from "../../data-store/DataStoreMetadata";
import _ from "lodash";
import { DataValue } from "../entities/DataValue";
import { AggregatedMetadatafields } from "../usecases/AggregatedSyncUseCase";
import { getMinimumParents } from "../utils";

type AggregatedPayload = {
    dataValues: DataValue[];
};

export class AggregatedPayloadBuilder {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async build(syncBuilder: SynchronizationBuilder, remoteInstance?: Instance): Promise<AggregatedPayload> {
        const { dataParams: { enableAggregation = false } = {} } = syncBuilder;

        if (enableAggregation) {
            return this.buildAnalyticsPayload(syncBuilder, remoteInstance);
        } else {
            return this.buildNormalPayload(syncBuilder, remoteInstance);
        }
    }

    private async buildNormalPayload(syncBuilder: SynchronizationBuilder, remoteInstance?: Instance) {
        const { dataParams = {}, excludedIds = [], originInstance: originInstanceId, metadataIds } = syncBuilder;
        const aggregatedRepository = await this.getAggregatedRepository(remoteInstance?.id || originInstanceId);

        const { dataSets = [] } = await this.extractMetadata<DataSet>(metadataIds);
        const { dataElementGroups = [] } = await this.extractMetadata<DataElementGroup>(metadataIds);
        const { dataElementGroupSets = [] } = await this.extractMetadata<DataElementGroupSet>(metadataIds);
        const { dataElements = [] } = await this.extractMetadata<DataElement>(metadataIds);

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
    }

    private async buildAnalyticsPayload(syncBuilder: SynchronizationBuilder, remoteInstance?: Instance) {
        const { dataParams = {}, excludedIds = [], metadataIds, originInstance: originInstanceId } = syncBuilder;

        // TODO: All these extract metadata methods can be combined if properly typed
        const { dataSets = [] } = await this.extractMetadata<DataSet>(metadataIds, remoteInstance);
        const { dataElementGroups = [] } = await this.extractMetadata<DataElementGroup>(metadataIds, remoteInstance);
        const { dataElementGroupSets = [] } = await this.extractMetadata<DataElementGroupSet>(
            metadataIds,
            remoteInstance
        );
        const { dataElements = [] } = await this.extractMetadata<DataElement>(metadataIds, remoteInstance);
        const { indicators = [] } = await this.extractMetadata<Indicator>(metadataIds, remoteInstance);
        const { programIndicators = [] } = await this.extractMetadata<ProgramIndicator>(metadataIds, remoteInstance);

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

        const aggregatedRepository = await this.getAggregatedRepository(originInstanceId, remoteInstance);

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
    }

    @cache()
    protected async getAggregatedRepository(originInstanceId: string, remoteInstance?: Instance) {
        const defaultInstance = await this.getOriginInstance(originInstanceId);
        return this.repositoryFactory.aggregatedRepository(remoteInstance ?? defaultInstance);
    }

    @cache()
    protected getMetadataRepository(instance: Instance) {
        return this.repositoryFactory.metadataRepository(instance);
    }

    @cache()
    public async getOriginInstance(originInstanceId: string): Promise<Instance> {
        const instance = await this.getInstanceById(originInstanceId);

        if (!instance) throw new Error("Unable to read origin instance");
        return instance;
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        const instance = await this.repositoryFactory.instanceRepository(this.localInstance).getById(id);
        if (!instance) return undefined;

        try {
            const version = await this.repositoryFactory.instanceRepository(instance).getVersion();
            return instance.update({ version });
        } catch (error: any) {
            return instance;
        }
    }

    @cache()
    public async extractMetadata<T>(metadataIds: string[], instance = this.localInstance): Promise<MetadataPackage<T>> {
        const onlyMetadataIds = metadataIds.filter(id => !DataStoreMetadata.isDataStoreId(id));
        const cleanIds = onlyMetadataIds.map(id => _.last(id.split("-")) ?? id);
        const metadataRepository = await this.getMetadataRepository(instance);
        return metadataRepository.getMetadataByIds<T>(cleanIds, AggregatedMetadatafields);
    }
}
