import { D2CategoryOptionCombo } from "d2-api";
import _ from "lodash";
import memoize from "nano-memoize";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import { DataImportResponse } from "../../types/d2";
import { AggregatedPackage, DataValue } from "../../types/synchronization";
import {
    buildMetadataDictionary,
    cleanDataImportResponse,
    cleanObjectDefault,
    cleanOrgUnitPath,
    getAggregatedData,
    getCategoryOptionCombos,
    getDefaultIds,
    mapCategoryOptionCombo,
    mapOptionValue,
    postAggregatedData,
} from "../../utils/synchronization";
import { GenericSync } from "./generic";

export class AggregatedSync extends GenericSync {
    protected readonly type = "aggregated";
    protected readonly fields =
        "id,dataElements[id,name]dataSetElements[:all,dataElement[id,name]],dataElementGroups[id,dataElements[id,name]],name";

    public buildPayload = memoize(async () => {
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
        const { dataValues: directDataValues = [] } = await getAggregatedData(
            this.api,
            dataParams,
            dataSetIds,
            _([...dataElementGroupIds, ...dataElementGroupSetIds])
                .flatten()
                .uniq()
                .value()
        );

        // Retrieve candidate data values from dataElements
        const { dataValues: candidateDataValues = [] } = await getAggregatedData(
            this.api,
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
    });

    protected async postPayload(instance: Instance) {
        const { dataParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();
        const mappedPayloadPackage = await this.mapMetadata(instance, payloadPackage);
        console.debug("Aggregated package", { payloadPackage, mappedPayloadPackage });

        return postAggregatedData(instance, mappedPayloadPackage, dataParams);
    }

    protected cleanResponse(response: DataImportResponse, instance: Instance) {
        return cleanDataImportResponse(response, instance);
    }

    protected async buildDataStats() {
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

    protected async mapMetadata(
        instance: Instance,
        payload: AggregatedPackage
    ): Promise<AggregatedPackage> {
        const { dataValues: oldDataValues } = payload;
        const defaultIds = await getDefaultIds(this.api);
        const originCategoryOptionCombos = await getCategoryOptionCombos(this.api);
        const destinationCategoryOptionCombos = await getCategoryOptionCombos(instance.getApi());

        const dataValues = oldDataValues
            .map(dataValue => cleanObjectDefault(dataValue, defaultIds))
            .map(dataValue =>
                this.buildMappedDataValue(
                    dataValue,
                    instance.metadataMapping,
                    originCategoryOptionCombos,
                    destinationCategoryOptionCombos
                )
            )
            .filter(this.isDisabledDataValue);

        return { dataValues };
    }

    private buildMappedDataValue(
        { orgUnit, dataElement, categoryOptionCombo, value, comment, ...rest }: DataValue,
        globalMapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): DataValue {
        const { organisationUnits = {}, dataElements = {} } = globalMapping;
        const { mapping: innerMapping = {} } = dataElements[dataElement] ?? {};

        const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
        const mappedDataElement = dataElements[dataElement]?.mappedId ?? dataElement;
        const mappedValue =
            mapOptionValue(value, innerMapping) ?? mapOptionValue(value, globalMapping) ?? value;
        const mappedComment =
            mapOptionValue(comment, innerMapping) ??
            mapOptionValue(comment, globalMapping) ??
            comment;
        const mappedCategory =
            mapCategoryOptionCombo(
                categoryOptionCombo,
                innerMapping,
                originCategoryOptionCombos,
                destinationCategoryOptionCombos
            ) ??
            mapCategoryOptionCombo(
                categoryOptionCombo,
                globalMapping,
                originCategoryOptionCombos,
                destinationCategoryOptionCombos
            ) ??
            categoryOptionCombo;

        return {
            orgUnit: cleanOrgUnitPath(mappedOrgUnit),
            dataElement: mappedDataElement,
            categoryOptionCombo: mappedCategory,
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
}
