import { TEIsPackage } from "../../../entities/TEIsPackage";
import { TEIsToEventPayloadMapper } from "../TEIsToEventPayloadMapper";
import { ProgramRef } from "../../Models";
import { EventsPackage } from "../../../../events/entities/EventsPackage";
import { MetadataMappingDictionary } from "../../../../mapping/entities/MetadataMapping";

import teiWithTwoPrograms from "./data/tei/teiWithTwoPrograms.json";

import mappingPrograms from "./data/mapping/mappingPrograms.json";
import mappingProgramsAndAllAttributes from "./data/mapping/mappingProgramsAndAllAttributes.json";

import destinationTwoTrackerPrograms from "./data/programs/destinationTwoTrackerPrograms.json";
import destinationTwoEventPrograms from "./data/programs/destinationTwoEventPrograms.json";
import destinatioOneTrackerProgramAndOneEventProgram from "./data/programs/destinatioOneTrackerProgramAndOneEventProgram.json";

import emptyEvents from "./data/expected/emptyEvents.json";
import twoEventsWithAllValues from "./data/expected/twoEventsWithAllValues.json";
import oneEventWithValues from "./data/expected/oneEventWithValues.json";

describe("TEIsToEventPayloadMapper", () => {
    it("should return empty events if tracker programs are mapped to tracker programs", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingPrograms,
            destinationTwoTrackerPrograms as ProgramRef[]
        );

        const payload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(emptyEvents);
    });
    it("should return empty events if tracker programs are mapped to event programs but not exist TE Att to DE mapping", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingPrograms,
            destinationTwoEventPrograms as ProgramRef[]
        );

        const payload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(emptyEvents);
    });
    it("should return two events if two tracker programs are mapped to event programs and exist TE Att to DE mapping", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingProgramsAndAllAttributes,
            destinationTwoEventPrograms as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(twoEventsWithAllValues);
    });
    it("should return one event if one tracker programs are mapped to event program and exist TE Att to DE mapping", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingProgramsAndAllAttributes,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(oneEventWithValues);
    });
});

function createTEIsToEventPayloadMapper(
    mapping: MetadataMappingDictionary,
    allPosibleDestinationPrograms: ProgramRef[]
): TEIsToEventPayloadMapper {
    return new TEIsToEventPayloadMapper(
        mapping,
        allPosibleDestinationPrograms as ProgramRef[],
        () => "2021-03-25T12:39:53.875",
        () => "BBe4UujWIHC"
    );
}
