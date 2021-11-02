import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { AggregatedPayloadMapper } from "../AggregatedPayloadMapper";

import originCategoryOptionCombos from "./data/category_option_combos/origin.json";
import destinationCategoryOptionCombos from "./data/category_option_combos/destination.json";

import dataValues from "./data/data-values/dataValues.json";

import orgUnitsMapping from "./data/mapping/mapping_orgUnits.json";

import dataValuesWithoutMapping from "./data/expected/dataValues_without_mapping.json";
import dataValuesOrgUnitsMapping from "./data/expected/dataValues_orgunits_mapping.json";

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
