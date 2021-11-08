import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { AggregatedPayloadMapper } from "../AggregatedPayloadMapper";

import originCategoryOptionCombos from "./data/category_option_combos/origin.json";
import destinationCategoryOptionCombos from "./data/category_option_combos/destination.json";

import dataValues from "./data/data-values/dataValues.json";
import dataValuesIndicator from "./data/data-values/dataValues_indicator.json";
import dataValuesCommentOption from "./data/data-values/dataValues_comment_option.json";
import dataValuesProgramIndicator from "./data/data-values/dataValues_program_indicator.json";

import orgUnitsMapping from "./data/mapping/mapping_orgUnits.json";
import dataElementsMapping from "./data/mapping/mapping_dataelements.json";
import deCategoryOptionMapping from "./data/mapping/mapping_de_category_option.json";
import globalCategoryOptionMapping from "./data/mapping/mapping_global_category_option.json";
import deOptionMapping from "./data/mapping/mapping_de_options.json";
import deOptionMappingByValue from "./data/mapping/mapping_de_option_by_value.json";
import globalOptionMapping from "./data/mapping/mapping_global_options.json";
import globalOptionMappingByValue from "./data/mapping/mapping_global_option_by_value.json";
import deOptionAndGlobalMapping from "./data/mapping/mapping_de_options.json";
import disabledDataElementsMapping from "./data/mapping/mapping_disabled_dataelements.json";
import disabledDeOptionMapping from "./data/mapping/mapping_disabled_de_options.json";
import disabledGlobalOptionMapping from "./data/mapping/mapping_disabled_global_options.json";
import disabledOrgUnitsMapping from "./data/mapping/mapping_disabled_orgUnits.json";
import indicatorDataElementMapping from "./data/mapping/mapping_indicator_dataelement.json";
import programIndicatorDataElementMapping from "./data/mapping/mapping_program_indicator_dataelement.json";

import dataValuesWithoutMapping from "./data/expected/dataValues_without_mapping.json";
import dataValuesOrgUnitsMapping from "./data/expected/dataValues_orgunits_mapping.json";
import dataValuesDataElementsMapping from "./data/expected/dataValues_dataelements_mapping.json";
import dataValuesDECategoryOptionMapping from "./data/expected/dataValues_de_category_option_mapping.json";
import dataValuesGlobalCategoryOptionMapping from "./data/expected/dataValues_global_category_option_mapping.json";
import dataValuesDEOptionMapping from "./data/expected/dataValues_de_option_mapping.json";
import dataValuesDEOptionAndGlobalMapping from "./data/expected/dataValues_de_option_and_global_mapping.json";
import dataValuesDEOptionMappingByValue from "./data/expected/dataValues_de_option_mapping_by_value.json";
import dataValuesGlobalOptionMapping from "./data/expected/dataValues_global_option_mapping.json";
import dataValuesGlobalOptionMappingByValue from "./data/expected/dataValues_global_option_mapping_by_value.json";
import dataValuesEmpty from "./data/expected/dataValues_empty.json";
import dataValuesDisabledOptionMapping from "./data/expected/dataValues_disabled_option_mapping.json";
import dataValuesIndicatorDataElementMapping from "./data/expected/dataValues_indicator_dataelement_mapping.json";
import dataValuesCommentMapping from "./data/expected/dataValues_comment_option_mapping.json";
import dataValuesProgramIndicatorDataElementMapping from "./data/expected/dataValues_program_indicator_de_mapping.json";

describe("AggreggatedPayloadMapper", () => {
    it("should return the expected payload if mapping is empty", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper({});

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesWithoutMapping);
    });
    it("should return the payload with mapped orgUnit if mapping contain orgUnits", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(orgUnitsMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesOrgUnitsMapping);
    });
    it("should return the payload with mapped data elements if mapping contain data elements", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(dataElementsMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesDataElementsMapping);
    });
    it("should return the payload with mapped category option if mapping contain category option by DE", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(deCategoryOptionMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesDECategoryOptionMapping);
    });
    it("should return the payload with mapped category option if mapping contain global category option", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(globalCategoryOptionMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesGlobalCategoryOptionMapping);
    });
    it("should return the payload with mapped option if mapping contain options by DE", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(deOptionMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesDEOptionMapping);
    });
    it("should return the payload with mapped option if mapping contain options by DE and value", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(deOptionMappingByValue);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesDEOptionMappingByValue);
    });
    it("should return the payload with mapped option if mapping contain global option", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(globalOptionMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesGlobalOptionMapping);
    });
    it("should return the payload with mapped option if mapping contain global option by value", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(globalOptionMappingByValue);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesGlobalOptionMappingByValue);
    });
    it("should return the payload with mapped option by DE if mapping contain global options and options by DE", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(deOptionAndGlobalMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesDEOptionAndGlobalMapping);
    });
    it("should return the payload with empty data values if mapping contain disabled data elements", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(disabledDataElementsMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesEmpty);
    });
    it("should return the payload with empty data values if mapping contain disabled DE options", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(disabledDeOptionMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesDisabledOptionMapping);
    });
    it("should return the payload with empty data values if mapping contain disabled global options", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(disabledGlobalOptionMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesDisabledOptionMapping);
    });
    it("should return the payload with empty data values if mapping contain disabled org unit", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(disabledOrgUnitsMapping);

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesEmpty);
    });
    it("should return the payload with mapped data element if mapping contain indicator to data element mapping", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(indicatorDataElementMapping);

        const mappedPayload = await aggregatedMapper.map(dataValuesIndicator);

        expect(mappedPayload).toEqual(dataValuesIndicatorDataElementMapping);
    });
    it("should return the payload with mapped comment if mapping contain option", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(deOptionMapping);

        const mappedPayload = await aggregatedMapper.map(dataValuesCommentOption);

        expect(mappedPayload).toEqual(dataValuesCommentMapping);
    });
    it("should return the payload with mapped data element if mapping contain program indicator to data element mapping", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper(programIndicatorDataElementMapping);

        const mappedPayload = await aggregatedMapper.map(dataValuesProgramIndicator);

        expect(mappedPayload).toEqual(dataValuesProgramIndicatorDataElementMapping);
    });
});

function createAggregatedPayloadMapper(mapping: MetadataMappingDictionary): AggregatedPayloadMapper {
    const defaultIds = ["HllvX50cXC0", "bjDvmb4bfuf", "xYerKDKCefk", "GLevLNI9wkl"];

    return new AggregatedPayloadMapper(
        mapping,
        originCategoryOptionCombos,
        destinationCategoryOptionCombos,
        defaultIds,
        []
    );
}
