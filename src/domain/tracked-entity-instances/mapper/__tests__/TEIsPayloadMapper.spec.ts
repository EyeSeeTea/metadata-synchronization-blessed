import { TEIsPackage } from "../../entities/TEIsPackage";
import { TEIsPayloadMapper } from "../TEIsPayloadMapper";

import singleTEI from "./data/tei/singleTEI.json";
import twoRelatedTEIs from "./data/tei/twoRelatedTEIs.json";
import twoRelatedTEIsMapWithRelationship from "./data/expected/twoRelatedTEIsMapWithRelationship.json";
import singleTEIMapWithRelationship from "./data/expected/singleTEIMapWithRelationship.json";
import mappingWithRelationshipTypes from "./data/mapping/mappingWithRelationshipTypes.json";

describe("TEIsPayloadMapper", () => {
    it("should return the same payload if mapping is empty", async () => {
        const teiMapper = new TEIsPayloadMapper({});

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(payload);
    });
    it("should return the payload with mapped relationshipTypes if mapping contain relationshipTypes", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingWithRelationshipTypes);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithRelationship);
    });
    it("should remove duplicate relationships to avoid alreay exists relationships 409 api bug", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingWithRelationshipTypes);

        const payload = twoRelatedTEIs as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(twoRelatedTEIsMapWithRelationship);
    });
});

export {};
