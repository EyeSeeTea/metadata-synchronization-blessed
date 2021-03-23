import { TEIsPackage } from "../../entities/TEIsPackage";
import { TEIsPayloadMapper } from "../TEIsPayloadMapper";

import singleTEI from "./data/tei/singleTEI.json";
import twoRelatedTEIs from "./data/tei/twoRelatedTEIs.json";

import mappingWithRelationshipTypes from "./data/mapping/mappingWithRelationshipTypes.json";
import mappingWithOrgUnits from "./data/mapping/mappingWithOrgUnits.json";
import mappingTrackerProgramToTrackerProgram from "./data/mapping/mappingTrackerProgramToTrackerProgram.json";
import mappingTEAttToTEAtt from "./data/mapping/mappingTEAttToTEAtt.json";

import twoRelatedTEIsMapWithRelationship from "./data/expected/twoRelatedTEIsMapWithRelationship.json";
import singleTEIMapWithRelationship from "./data/expected/singleTEIMapWithRelationship.json";
import singleTEIMapWithOrgUnit from "./data/expected/singleTEIMapWithOrgUnit.json";
import singleTEIMapWithProgram from "./data/expected/singleTEIMapWithProgram.json";
import singleTEIMapWithTEAttToTEAtt from "./data/expected/singleTEIMapWithTEAttToTEAtt.json";

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
    it("should remove duplicate relationships to avoid already exists relationships 409 api bug", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingWithRelationshipTypes);

        const payload = twoRelatedTEIs as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(twoRelatedTEIsMapWithRelationship);
    });
    it("should return the payload with mapped orgUnit if mapping contain orgUnits", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingWithOrgUnits);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithOrgUnit);
    });
    it("should return the payload with mapped program if mapping contain tracker programs", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTrackerProgramToTrackerProgram);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithProgram);
    });
    it("should return the payload with mapped TE Attribute if mapping contain TE Attribute to TE Attribute", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTEAttToTEAtt);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt);
    });
});

export {};
