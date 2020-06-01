import _ from "lodash";
import memoize from "nano-memoize";
import { AggregatedD2ApiRepository } from "../../../data/aggregated/repositories/AggregatedD2ApiRepository";
import { mapPackageToD2 } from "../../../data/metadata/mappers/PackageMapper";
import { aggregatedTransformationsToDhis2 } from "../../../data/metadata/mappers/PackageTransformations";
import Instance, { MetadataMappingDictionary } from "../../../models/instance";
import { D2 } from "../../../types/d2";
import { D2Api, D2CategoryOptionCombo } from "../../../types/d2-api";
import { SynchronizationBuilder } from "../../../types/synchronization";
import { promiseMap } from "../../../utils/common";
import {
    cleanDataImportResponse,
    getCategoryOptionCombos,
    mapCategoryOptionCombo,
    mapOptionValue,
} from "../../../utils/synchronization";
import InstanceEntity from "../../instance/Instance";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import {
    buildMetadataDictionary,
    cleanObjectDefault,
    cleanOrgUnitPath,
} from "../../synchronization/utils";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { DataValue } from "../entities/DataValue";
import { AggregatedRepository } from "../repositories/AggregatedRepository";
import { MetadataRepository } from "../../metadata/MetadataRepositoriy";
import MetadataD2ApiRepository from "../../../data/metadata/repositories/MetadataD2ApiRepository";

export class AggregatedSyncUseCase extends GenericSyncUseCase {
    public readonly type = "aggregated";
    public readonly fields =
        "id,dataElements[id,name],dataSetElements[:all,dataElement[id,name]],dataElementGroups[id,dataElements[id,name]],name";
    private aggregatedRepository: AggregatedRepository;
    private metadataRepository: MetadataRepository;

    constructor(d2: D2, api: D2Api, builder: SynchronizationBuilder) {
        super(d2, api, builder);

        //TODO: composition root - This dependency should be injected by constructor when we have
        // composition root
        this.aggregatedRepository = new AggregatedD2ApiRepository(api);
        this.metadataRepository = new MetadataD2ApiRepository(api);
    }

    public buildPayload = memoize(async () => {
        const { dataParams: { enableAggregation = false } = {} } = this.builder;

        if (enableAggregation) {
            return this.buildAnalyticsPayload();
        } else {
            return this.buildNormalPayload();
        }
    });

    private buildNormalPayload = async () => {
        const { dataParams = {}, excludedIds = [] } = this.builder;
        const {
            dataSets = [],
            dataElementGroups = [],
            dataElementGroupSets = [],
            dataElements = [],
        } = await this.extractMetadata();

        const dataSetIds = dataSets.map(({ id }) => id);
        const dataElementGroupIds = dataElementGroups.map(({ id }) => id);
        const dataElementGroupSetIds = dataElementGroupSets.map(({ dataElementGroups }) =>
            dataElementGroups.map(({ id }: any) => id)
        );

        // Retrieve direct data values from dataSets and dataElementGroups
        const { dataValues: directDataValues = [] } = await this.aggregatedRepository.getAggregated(
            dataParams,
            dataSetIds,
            _([...dataElementGroupIds, ...dataElementGroupSetIds])
                .flatten()
                .uniq()
                .value()
        );

        // Retrieve candidate data values from dataElements
        const {
            dataValues: candidateDataValues = [],
        } = await this.aggregatedRepository.getAggregated(
            dataParams,
            dataElements.map(de => de.dataSetElements.map((dse: any) => dse.dataSet?.id)),
            dataElements.map(de => de.dataElementGroups.map((deg: any) => deg.id))
        );

        // Retrieve indirect data values from dataElements
        const indirectDataValues = _.filter(
            candidateDataValues,
            ({ dataElement }) => !!_.find(dataElements, { id: dataElement })
        );

        const dataValues = _([...directDataValues, ...indirectDataValues])
            .uniqWith(_.isEqual)
            .reject(({ dataElement }) => excludedIds.includes(dataElement))
            .value();

        return { dataValues };
    };

    private buildAnalyticsPayload = async () => {
        const { dataParams = {}, excludedIds = [] } = this.builder;

        const {
            dataSets = [],
            dataElementGroups = [],
            dataElementGroupSets = [],
            dataElements = [],
            indicators = [],
        } = await this.extractMetadata();

        const dataElementIds = dataElements.map(({ id }) => id);
        const indicatorIds = indicators.map(({ id }) => id);
        const dataSetIds = _.flatten(
            dataSets.map(({ dataSetElements }) =>
                dataSetElements.map(({ dataElement }: any) => dataElement.id)
            )
        );
        const dataElementGroupIds = _.flatten(
            dataElementGroups.map(({ dataElements }) => dataElements.map(({ id }: any) => id))
        );
        const dataElementGroupSetIds = _.flatten(
            dataElementGroupSets.map(({ dataElementGroups }) =>
                _.flatten(
                    dataElementGroups.map(({ dataElements }: any) =>
                        dataElements.map(({ id }: any) => id)
                    )
                )
            )
        );

        const { dataValues: dataElementValues = [] } = await this.aggregatedRepository.getAnalytics(
            {
                dataParams,
                dimensionIds: [
                    ...dataElementIds,
                    ...dataSetIds,
                    ...dataElementGroupIds,
                    ...dataElementGroupSetIds,
                ],
                includeCategories: true,
            }
        );

        const { dataValues: indicatorValues = [] } = await this.aggregatedRepository.getAnalytics({
            dataParams,
            dimensionIds: indicatorIds,
            includeCategories: false,
        });

        const dataValues = _.reject([...dataElementValues, ...indicatorValues], ({ dataElement }) =>
            excludedIds.includes(dataElement)
        );

        return { dataValues };
    };

    public async postPayload(instance: Instance, instanceEntity: InstanceEntity) {
        const { dataParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();
        const mappedPayloadPackage = await this.mapPayload(instance, payloadPackage);

        if (!instanceEntity.apiVersion) {
            throw new Error(
                "Necessary api version of receiver instance to apply transformations to package is undefined"
            );
        }

        const versionedPayloadPackage = mapPackageToD2(
            instanceEntity.apiVersion,
            mappedPayloadPackage,
            aggregatedTransformationsToDhis2
        );
        console.debug("Aggregated package", {
            payloadPackage,
            mappedPayloadPackage,
            versionedPayloadPackage,
        });

        const response = await this.aggregatedRepository.save(versionedPayloadPackage, dataParams);
        return [cleanDataImportResponse(response, instance, this.type)];
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

    public async mapPayload(
        instance: Instance,
        payload: AggregatedPackage
    ): Promise<AggregatedPackage> {
        const { dataValues: oldDataValues } = payload;
        const { metadataMapping: mapping } = instance;

        const defaultIds = await this.metadataRepository.getDefaultIds();
        const originCategoryOptionCombos = await getCategoryOptionCombos(this.api);
        const destinationCategoryOptionCombos = await getCategoryOptionCombos(instance.getApi());
        const instanceAggregatedValues = await this.buildInstanceAggregation(
            mapping,
            destinationCategoryOptionCombos
        );

        const dataValues = _([...instanceAggregatedValues, ...oldDataValues])
            .map(dataValue =>
                this.buildMappedDataValue(
                    dataValue,
                    mapping,
                    originCategoryOptionCombos,
                    destinationCategoryOptionCombos
                )
            )
            .map(dataValue => cleanObjectDefault(dataValue, defaultIds))
            .filter(this.isDisabledDataValue)
            .uniqBy(({ orgUnit, period, dataElement, categoryOptionCombo }) =>
                [orgUnit, period, dataElement, categoryOptionCombo].join("-")
            )
            .value();

        return { dataValues };
    }

    private buildMappedDataValue(
        {
            orgUnit,
            dataElement,
            categoryOptionCombo,
            attributeOptionCombo,
            value,
            comment,
            ...rest
        }: DataValue,
        globalMapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): DataValue {
        const { organisationUnits = {}, aggregatedDataElements = {} } = globalMapping;
        const { mapping: innerMapping = {} } = aggregatedDataElements[dataElement] ?? {};

        const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
        const mappedDataElement = aggregatedDataElements[dataElement]?.mappedId ?? dataElement;
        const mappedValue = mapOptionValue(value, [innerMapping, globalMapping]);
        const mappedComment = mapOptionValue(comment, [innerMapping, globalMapping]);
        const mappedCategory =
            mapCategoryOptionCombo(
                categoryOptionCombo,
                [innerMapping, globalMapping],
                originCategoryOptionCombos,
                destinationCategoryOptionCombos
            ) ?? categoryOptionCombo;
        const mappedAttribute = mapCategoryOptionCombo(
            attributeOptionCombo,
            [innerMapping, globalMapping],
            originCategoryOptionCombos,
            destinationCategoryOptionCombos
        );

        return {
            orgUnit: cleanOrgUnitPath(mappedOrgUnit),
            dataElement: mappedDataElement,
            categoryOptionCombo: mappedCategory,
            attributeOptionCombo: mappedAttribute,
            value: mappedValue,
            comment: comment ? mappedComment : undefined,
            ...rest,
        };
    }

    private isDisabledDataValue(dataValue: DataValue): boolean {
        return !_(dataValue)
            .pick([
                "orgUnit",
                "dataElement",
                "categoryOptionCombo",
                "attributeOptionCombo",
                "value",
            ])
            .values()
            .includes("DISABLED");
    }

    private async buildInstanceAggregation(
        mapping: MetadataMappingDictionary,
        categoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): Promise<DataValue[]> {
        const { dataParams = {} } = this.builder;
        const { enableAggregation = false } = dataParams;
        if (!enableAggregation) return [];

        const result = await promiseMap(
            await this.aggregatedRepository.getOptions(mapping, categoryOptionCombos),
            async ({ dataElement, categoryOptions, category, mappedOptionCombo }) => {
                const { dataValues } = await this.aggregatedRepository.getAnalytics({
                    dataParams,
                    dimensionIds: [dataElement],
                    includeCategories: false,
                    filter: [`${category}:${categoryOptions.join(";")}`],
                });

                return dataValues.map(dataValue => ({
                    ...dataValue,
                    categoryOptionCombo: mappedOptionCombo,
                }));
            }
        );

        return _.flatten(result);
    }
}
