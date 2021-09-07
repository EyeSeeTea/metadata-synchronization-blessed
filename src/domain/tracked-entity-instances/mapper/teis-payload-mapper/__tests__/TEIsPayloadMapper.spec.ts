import { TEIsPackage } from "../../../entities/TEIsPackage";
import { TEIsPayloadMapper } from "../TEIsPayloadMapper";
import { ProgramRef } from "../../Models";

import singleTEI from "./data/tracker-to-tracker/tei/singleTEI.json";
import twoRelatedTEIs from "./data/tracker-to-tracker/tei/twoRelatedTEIs.json";

import mappingWithRelationshipTypes from "./data/tracker-to-tracker/mapping/mappingWithRelationshipTypes.json";
import mappingWithOrgUnits from "./data/tracker-to-tracker/mapping/mappingWithOrgUnits.json";
import mappingTrackerProgramToTrackerProgram from "./data/tracker-to-tracker/mapping/mappingTrackerProgramToTrackerProgram.json";
import mappingTEAttToTEAtt from "./data/tracker-to-tracker/mapping/mappingTEAttToTEAtt.json";
import mappingTEAttToTEAtt_WithOptions from "./data/tracker-to-tracker/mapping/mappingTEAttToTEAtt_WithOptions.json";
import mappingTEAttToTEAtt_WithGlobalOptions from "./data/tracker-to-tracker/mapping/mappingTEAttToTEAtt_WithGlobalOptions.json";

import mappingWithRelationshipTypes_Disabled from "./data/tracker-to-tracker/mapping/mappingWithRelationshipTypes_Disabled.json";
import mappingWithOrgUnits_Disabled from "./data/tracker-to-tracker/mapping/mappingWithOrgUnits_Disabled.json";
import mappingTrackerProgramToTrackerProgram_disabled from "./data/tracker-to-tracker/mapping/mappingTrackerProgramToTrackerProgram_disabled.json";
import mappingTEAttToTEAtt_disabled from "./data/tracker-to-tracker/mapping/mappingTEAttToTEAtt_disabled.json";
import mappingTEAttToTEAtt_WithOptions_disabled from "./data/tracker-to-tracker/mapping/mappingTEAttToTEAtt_WithOptions_disabled.json";
import mappingTEAttToTEAtt_WithGlobalOptions_disabled from "./data/tracker-to-tracker/mapping/mappingTEAttToTEAtt_WithGlobalOptions_disabled.json";

import twoRelatedTEIsMapWithRelationship from "./data/tracker-to-tracker/expected/twoRelatedTEIsMapWithRelationship.json";
import singleTEIMapWithRelationship from "./data/tracker-to-tracker/expected/singleTEIMapWithRelationship.json";
import singleTEIMapWithOrgUnit from "./data/tracker-to-tracker/expected/singleTEIMapWithOrgUnit.json";
import singleTEIMapWithProgram from "./data/tracker-to-tracker/expected/singleTEIMapWithProgram.json";
import singleTEIMapWithTEAttToTEAtt from "./data/tracker-to-tracker/expected/singleTEIMapWithTEAttToTEAtt.json";
import singleTEIMapWithTEAttToTEAtt_WithOptions from "./data/tracker-to-tracker/expected/singleTEIMapWithTEAttToTEAtt_WithOptions.json";
import singleTEIMapWithTEAttToTEAtt_WithGlobalOptions from "./data/tracker-to-tracker/expected/singleTEIMapWithTEAttToTEAtt_WithGlobalOptions.json";

import singleTEIMapWithRelationship_Disabled from "./data/tracker-to-tracker/expected/singleTEIMapWithRelationship_Disabled.json";
import singleTEIMapWithOrgUnit_Disabled from "./data/tracker-to-tracker/expected/singleTEIMapWithOrgUnit_Disabled.json";
import singleTEIMapWithProgram_Disabled from "./data/tracker-to-tracker/expected/singleTEIMapWithProgram_Disabled.json";
import singleTEIMapWithTEAttToTEAtt_Disabled from "./data/tracker-to-tracker/expected/singleTEIMapWithTEAttToTEAtt_Disabled.json";
import singleTEIMapWithTEAttToTEAtt_WithOptions_Disabled from "./data/tracker-to-tracker/expected/singleTEIMapWithTEAttToTEAtt_WithOption_Disabled.json";

import destinationTrackerProgram from "./data/tracker-to-tracker/programs/destinationTrackerProgram.json";
import destinationTrackerProgram_WithTEAttToTEAtt from "./data/tracker-to-tracker/programs/destinationTrackerProgram_WithTEAttToTEAtt.json";
import destinationTrackerProgram_WithOptions from "./data/tracker-to-tracker/programs/destinationTrackerProgram_WithOptions.json";
import destinationTrackerProgram_MapWithProgram from "./data/tracker-to-tracker/programs/destinationTrackerProgram_MapWithProgram.json";
import teiWithTwoPrograms from "./data/tracker-to-event/tei/teiWithTwoPrograms.json";

import destinationTwoTrackerPrograms from "./data/tracker-to-event/programs/destinationTwoTrackerPrograms.json";
import destinatioOneTrackerProgramAndOneEventProgram from "./data/tracker-to-event/programs/destinatioOneTrackerProgramAndOneEventProgram.json";
import destinationTwoEventPrograms from "./data/tracker-to-event/programs/destinationTwoEventPrograms.json";

import mappingTwoTrackerPrograms from "./data/tracker-to-event/mapping/mappingTwoTrackerPrograms.json";

import teiWithTwoProgramsMapAllToTracker from "./data/tracker-to-event/expected/teiWithTwoProgramsMapAllToTracker.json";
import teiWithTwoProgramsMapToOneTracker from "./data/tracker-to-event/expected/teiWithTwoProgramsMapToOneTracker.json";
import teiWithTwoProgramsMapAllToEvent from "./data/tracker-to-event/expected/teiWithTwoProgramsMapAllToEvent.json";

describe("TEIsPayloadMapper", () => {
    describe("tracker to tracker", () => {
        it("should return the same payload if mapping is empty", async () => {
            const teiMapper = new TEIsPayloadMapper({}, destinationTrackerProgram as ProgramRef[]);

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(payload);
        });
        it("should return the payload with mapped relationshipTypes if mapping contain relationshipTypes", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingWithRelationshipTypes,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithRelationship);
        });
        it("should return the same payload if mapping contain relationshipTypes but disabled", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingWithRelationshipTypes_Disabled,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithRelationship_Disabled);
        });
        it("should remove duplicate relationships to avoid already exists relationships 409 api bug", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingWithRelationshipTypes,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = twoRelatedTEIs as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(twoRelatedTEIsMapWithRelationship);
        });
        it("should return the payload with mapped orgUnit if mapping contain orgUnits", async () => {
            const teiMapper = new TEIsPayloadMapper(mappingWithOrgUnits, destinationTrackerProgram as ProgramRef[]);

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithOrgUnit);
        });
        it("should return the same payload if mapping contain org units but disabled", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingWithOrgUnits_Disabled,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithOrgUnit_Disabled);
        });
        it("should return the payload with mapped program if mapping contain tracker programs", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTrackerProgramToTrackerProgram,
                destinationTrackerProgram_MapWithProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithProgram);
        });
        it("should return the same payload if mapping contain tracker programs but disabled", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTrackerProgramToTrackerProgram_disabled,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithProgram_Disabled);
        });
        it("should return the payload with mapped TE Attribute if mapping contain TE Attribute to TE Attribute", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTEAttToTEAtt,
                destinationTrackerProgram_WithTEAttToTEAtt as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt);
        });
        it("should return the same payload if mapping contain TE Attribute to TE Attribute but disabled", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTEAttToTEAtt_disabled,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_Disabled);
        });
        it("should return the payload with mapped TE Attribute if mapping contain TE Attribute to TE Attribute with options", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTEAttToTEAtt_WithOptions,
                destinationTrackerProgram_WithOptions as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_WithOptions);
        });
        it("should return the payload with mapped TE Attribute without option mapping if mapping contain TE Attribute to TE Attribute with options but disabled", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTEAttToTEAtt_WithOptions_disabled,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_WithOptions_Disabled);
        });

        it("should return the payload with mapped TE Attribute if mapping contain global options", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTEAttToTEAtt_WithGlobalOptions,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_WithGlobalOptions);
        });

        it("should return the same payload if mapping contain global options but disabled", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTEAttToTEAtt_WithGlobalOptions_disabled,
                destinationTrackerProgram as ProgramRef[]
            );

            const payload = singleTEI as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(singleTEIMapWithTEAttToTEAtt_WithOptions_Disabled);
        });
    });
    describe("tracker to event", () => {
        it("should return all enrollments and programOwners if tracker programs are mapped to tracker programs", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTwoTrackerPrograms,
                destinationTwoTrackerPrograms as ProgramRef[]
            );

            const payload = teiWithTwoPrograms as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(teiWithTwoProgramsMapAllToTracker);
        });
        it("should return one enrollments and programOwners if only one tracker program is mapped to a tracker program", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTwoTrackerPrograms,
                destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
            );

            const payload = teiWithTwoPrograms as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(teiWithTwoProgramsMapToOneTracker);
        });
        it("should return remove enrollments, programOwners and attributes if one tracker program is mapped to event program", async () => {
            const teiMapper = new TEIsPayloadMapper(
                mappingTwoTrackerPrograms,
                destinationTwoEventPrograms as ProgramRef[]
            );

            const payload = teiWithTwoPrograms as TEIsPackage;

            const mappedPayload = await teiMapper.map(payload);

            expect(mappedPayload).toEqual(teiWithTwoProgramsMapAllToEvent);
        });
    });
});

export {};
