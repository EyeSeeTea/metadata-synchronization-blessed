import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { AggregatedPayloadMapper } from "../AggregatedPayloadMapper";

import originCategoryOptionCombos from "./data/category_option_combos/origin.json";
import destinationCategoryOptionCombos from "./data/category_option_combos/destination.json";

import dataValues from "./data/data-values/dataValues.json";

import dataValuesWithoutMapping from "./data/expected/dataValues_without_mapping.json";

describe("AggreggatedPayloadMapper", () => {
    it("should return the expected payload if mapping is empty", async () => {
        const aggregatedMapper = createAggregatedPayloadMapper({});

        const mappedPayload = await aggregatedMapper.map(dataValues);

        expect(mappedPayload).toEqual(dataValuesWithoutMapping);
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
