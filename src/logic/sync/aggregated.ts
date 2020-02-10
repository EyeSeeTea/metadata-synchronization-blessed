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
            dataElements.map(de => de.dataSetElements.map((dse: any) => dse.dataSet.id)),
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
        const { organisationUnits = {}, dataElements = {} } = instance.metadataMapping;
        const { dataValues: oldDataValues } = payload;
        const { optionCombos } = await this.matchCategoryOptionCombos(instance, oldDataValues);
        const defaultIds = await getDefaultIds(this.api);

        const dataValues = oldDataValues
            .map(dataValue => cleanObjectDefault(dataValue, defaultIds))
            .map(
                ({
                    orgUnit,
                    dataElement,
                    categoryOptionCombo: categoryOption,
                    attributeOptionCombo: attributeOption,
                    ...rest
                }) => {
                    const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
                    const mappedDataElement = dataElements[dataElement]?.mappedId ?? dataElement;
                    const mappedCategory = optionCombos[categoryOption]?.mappedId ?? categoryOption;
                    const mappedAttribute =
                        optionCombos[attributeOption]?.mappedId ?? attributeOption;

                    return {
                        orgUnit: cleanOrgUnitPath(mappedOrgUnit),
                        dataElement: mappedDataElement,
                        categoryOptionCombo: mappedCategory,
                        attributeOptionCombo: mappedAttribute,
                        ...rest,
                    };
                }
            )
            .filter(
                ({ orgUnit, dataElement }) => orgUnit !== "DISABLED" && dataElement !== "DISABLED"
            );

        return { dataValues };
    }

    private async matchCategoryOptionCombos(
        instance: Instance,
        dataValues: DataValue[]
    ): Promise<MetadataMappingDictionary> {
        const { categoryOptions = {}, categoryCombos = {} } = instance.metadataMapping;

        // Build a list of candidate option combos from the provided data values
        const candidateOptionCombos = _(dataValues)
            .map(({ categoryOptionCombo, attributeOptionCombo }) => [
                categoryOptionCombo,
                attributeOptionCombo,
            ])
            .flatten()
            .uniq()
            .value();

        // Query origin for the category option combos asking for details of CO and CC
        const { objects: originObjects } = await this.api.models.categoryOptionCombos
            .get({
                fields: { id: true, categoryOptions: { id: true }, categoryCombo: { id: true } },
                filter: { id: { in: candidateOptionCombos } },
                paging: false,
            })
            .getData();

        const categoryOptionIds = _(originObjects)
            .map(o => o.categoryOptions.map(({ id }) => categoryOptions[id]?.mappedId ?? id))
            .flatten()
            .value();

        const categoryComboIds = _(originObjects)
            .map(({ categoryCombo: { id } }) => categoryCombos[id]?.mappedId ?? id)
            .flatten()
            .value();

        // Query destination for category option combos containing mapped CO and CC
        const { objects: destinationObjects } = await instance
            .getApi()
            .models.categoryOptionCombos.get({
                fields: { id: true, categoryOptions: { id: true }, categoryCombo: { id: true } },
                filter: {
                    "categoryOptions.id": { in: categoryOptionIds },
                    "categoryCombo.id": { in: categoryComboIds },
                },
                rootJunction: "OR",
                paging: false,
            })
            .getData();

        // Compile a list of mapped category option combos from candidates per CO and CC
        const optionCombos = _(originObjects)
            .map(({ id, categoryOptions: cos, categoryCombo: cc }) => {
                // Candidates built from equal category options
                const candidates = _.filter(destinationObjects, o =>
                    _.isEqual(
                        _.sortBy(o.categoryOptions, ["id"]),
                        _.sortBy(
                            cos.map(({ id }) => ({ id: categoryOptions[id]?.mappedId ?? id })),
                            ["id"]
                        )
                    )
                );

                // Exact object built from equal category options and combo
                const exactObject = _.find(candidates, o =>
                    _.isEqual(o.categoryCombo, { id: categoryCombos[cc.id]?.mappedId ?? cc.id })
                );

                // If there's only one candidate, ignore the category combo, else provide exact object
                const result = candidates.length === 1 ? _.first(candidates) : exactObject;
                return result ? [id, { mappedId: result.id }] : undefined;
            })
            .compact()
            .fromPairs()
            .value();

        return { optionCombos };
    }
}
