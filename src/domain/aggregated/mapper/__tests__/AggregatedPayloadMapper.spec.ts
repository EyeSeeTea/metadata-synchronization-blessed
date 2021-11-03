import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { AggregatedPayloadMapper } from "../AggregatedPayloadMapper";

import originCategoryOptionCombos from "./data/category_option_combos/origin.json";
import destinationCategoryOptionCombos from "./data/category_option_combos/destination.json";

import dataValues from "./data/data-values/dataValues.json";

import orgUnitsMapping from "./data/mapping/mapping_orgUnits.json";
import dataElementsMapping from "./data/mapping/mapping_dataelements.json";
import deCategoryOptionMapping from "./data/mapping/mapping_de_category_option.json";
import globalCategoryOptionMapping from "./data/mapping/mapping_global_category_option.json";

import dataValuesWithoutMapping from "./data/expected/dataValues_without_mapping.json";
import dataValuesOrgUnitsMapping from "./data/expected/dataValues_orgunits_mapping.json";
import dataValuesDataElementsMapping from "./data/expected/dataValues_dataelements_mapping.json";
import dataValuesDECategoryOptionMapping from "./data/expected/dataValues_de_category_option_mapping.json";
import dataValuesGlobalCategoryOptionMapping from "./data/expected/dataValues_global_category_option_mapping.json";

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
