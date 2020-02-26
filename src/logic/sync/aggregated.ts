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
        mapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): DataValue {
        const { organisationUnits = {}, dataElements = {} } = mapping;
        const { mapping: innerMapping = {} } = dataElements[dataElement] ?? {};

        const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
        const mappedDataElement = dataElements[dataElement]?.mappedId ?? dataElement;
        const mappedValue = this.mapOptionValue(value, innerMapping);
        const mappedComment = comment ? this.mapOptionValue(comment, innerMapping) : undefined;
        const mappedCategory = this.mapCategoryOptionCombo(
            categoryOptionCombo,
            innerMapping,
            originCategoryOptionCombos,
            destinationCategoryOptionCombos
        );

        return {
            orgUnit: cleanOrgUnitPath(mappedOrgUnit),
            dataElement: mappedDataElement,
            categoryOptionCombo: mappedCategory,
            value: mappedValue,
            comment: mappedComment,
            ...rest,
        };
    }

    private mapOptionValue(value: string, mapping: MetadataMappingDictionary): string {
        const { options } = mapping;
        const candidate = _(options)
            .values()
            .find(["code", value]);

        return candidate?.mappedCode ?? value;
    }

    private mapCategoryOptionCombo(
        optionCombo: string,
        mapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): string {
        const { categoryOptions = {}, categoryCombos = {} } = mapping;
        const origin = _.find(originCategoryOptionCombos, ["id", optionCombo]);
        const isDisabled = _.some(
            origin?.categoryOptions?.map(({ id }) => categoryOptions[id]),
            { mappedId: "DISABLED" }
        );
        const defaultValue = isDisabled ? "DISABLED" : optionCombo;

        // Candidates built from equal category options
        const candidates = _.filter(destinationCategoryOptionCombos, o =>
            _.isEqual(
                _.sortBy(o.categoryOptions, ["id"]),
                _.sortBy(
                    origin?.categoryOptions?.map(({ id }) => ({
                        id: categoryOptions[id]?.mappedId ?? id,
                    })),
                    ["id"]
                )
            )
        );

        // Exact object built from equal category options and combo
        const exactObject = _.find(candidates, o =>
            _.isEqual(o.categoryCombo, {
                id:
                    categoryCombos[origin?.categoryCombo?.id ?? ""]?.mappedId ??
                    origin?.categoryCombo?.id,
            })
        );

        // If there's only one candidate, ignore the category combo, else provide exact object
        const result = candidates.length === 1 ? _.first(candidates) : exactObject;
        return result?.id ?? defaultValue;
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
