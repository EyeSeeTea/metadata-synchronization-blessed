import { TEIsPackage } from "../../entities/TEIsPackage";
import { TEIsPayloadMapper } from "../TEIsPayloadMapper";

import singleTEI from "./data/tei/singleTEI.json";
import twoRelatedTEIs from "./data/tei/twoRelatedTEIs.json";

import mappingWithRelationshipTypes from "./data/mapping/mappingWithRelationshipTypes.json";
import mappingWithOrgUnits from "./data/mapping/mappingWithOrgUnits.json";
import mappingTrackerProgramToTrackerProgram from "./data/mapping/mappingTrackerProgramToTrackerProgram.json";
import mappingTEAttToTEAtt from "./data/mapping/mappingTEAttToTEAtt.json";
import mappingTEAttToTEAtt_WithOptions from "./data/mapping/mappingTEAttToTEAtt_WithOptions.json";
import mappingTEAttToTEAtt_WithGlobalOptions from "./data/mapping/mappingTEAttToTEAtt_WithGlobalOptions.json";

import mappingWithRelationshipTypes_Disabled from "./data/mapping/mappingWithRelationshipTypes_Disabled.json";
import mappingWithOrgUnits_Disabled from "./data/mapping/mappingWithOrgUnits_Disabled.json";
import mappingTrackerProgramToTrackerProgram_disabled from "./data/mapping/mappingTrackerProgramToTrackerProgram_disabled.json";
import mappingTEAttToTEAtt_disabled from "./data/mapping/mappingTEAttToTEAtt_disabled.json";
import mappingTEAttToTEAtt_WithOptions_disabled from "./data/mapping/mappingTEAttToTEAtt_WithOptions_disabled.json";
import mappingTEAttToTEAtt_WithGlobalOptions_disabled from "./data/mapping/mappingTEAttToTEAtt_WithGlobalOptions_disabled.json";

import twoRelatedTEIsMapWithRelationship from "./data/expected/twoRelatedTEIsMapWithRelationship.json";
import singleTEIMapWithRelationship from "./data/expected/singleTEIMapWithRelationship.json";
import singleTEIMapWithOrgUnit from "./data/expected/singleTEIMapWithOrgUnit.json";
import singleTEIMapWithProgram from "./data/expected/singleTEIMapWithProgram.json";
import singleTEIMapWithTEAttToTEAtt from "./data/expected/singleTEIMapWithTEAttToTEAtt.json";
import singleTEIMapWithTEAttToTEAtt_WithOptions from "./data/expected/singleTEIMapWithTEAttToTEAtt_WithOptions.json";
import singleTEIMapWithTEAttToTEAtt_WithGlobalOptions from "./data/expected/singleTEIMapWithTEAttToTEAtt_WithGlobalOptions.json";

import singleTEIMapWithRelationship_Disabled from "./data/expected/singleTEIMapWithRelationship_Disabled.json";
import singleTEIMapWithOrgUnit_Disabled from "./data/expected/singleTEIMapWithOrgUnit_Disabled.json";
import singleTEIMapWithProgram_Disabled from "./data/expected/singleTEIMapWithProgram_Disabled.json";
import singleTEIMapWithTEAttToTEAtt_Disabled from "./data/expected/singleTEIMapWithTEAttToTEAtt_Disabled.json";
import singleTEIMapWithTEAttToTEAtt_WithOptions_Disabled from "./data/expected/singleTEIMapWithTEAttToTEAtt_WithOption_Disabled.json";

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
    it("should return the same payload if mapping contain relationshipTypes but disabled", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingWithRelationshipTypes_Disabled);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithRelationship_Disabled);
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
    it("should return the same payload if mapping contain org units but disabled", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingWithOrgUnits_Disabled);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithOrgUnit_Disabled);
    });
    it("should return the payload with mapped program if mapping contain tracker programs", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTrackerProgramToTrackerProgram);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithProgram);
    });
    it("should return the same payload if mapping contain tracker programs but disabled", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTrackerProgramToTrackerProgram_disabled);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithProgram_Disabled);
    });
    it("should return the payload with mapped TE Attribute if mapping contain TE Attribute to TE Attribute", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTEAttToTEAtt);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt);
    });
    it("should return the same payload if mapping contain TE Attribute to TE Attribute but disabled", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTEAttToTEAtt_disabled);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_Disabled);
    });
    it("should return the payload with mapped TE Attribute if mapping contain TE Attribute to TE Attribute with options", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTEAttToTEAtt_WithOptions);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_WithOptions);
    });
    it("should return the payload with mapped TE Attribute without option mapping if mapping contain TE Attribute to TE Attribute with options but disabled", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTEAttToTEAtt_WithOptions_disabled);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_WithOptions_Disabled);
    });

    it("should return the payload with mapped TE Attribute if mapping contain global options", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTEAttToTEAtt_WithGlobalOptions);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_WithGlobalOptions);
    });

    it("should return the same payload if mapping contain global options but disabled", async () => {
        const teiMapper = new TEIsPayloadMapper(mappingTEAttToTEAtt_WithGlobalOptions_disabled);

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_WithOptions_Disabled);
    });
});

export {};
