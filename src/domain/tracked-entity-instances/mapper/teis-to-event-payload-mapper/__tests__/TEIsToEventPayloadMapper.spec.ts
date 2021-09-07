import { TEIsPackage } from "../../../entities/TEIsPackage";
import { TEIsToEventPayloadMapper } from "../TEIsToEventPayloadMapper";
import { ProgramRef } from "../../Models";
import { EventsPackage } from "../../../../events/entities/EventsPackage";
import { MetadataMappingDictionary } from "../../../../mapping/entities/MetadataMapping";

import teiWithTwoPrograms from "./data/tei/teiWithTwoPrograms.json";

import mappingPrograms from "./data/mapping/mappingPrograms.json";
import mappingToGenerateEvent from "./data/mapping/mappingToGenerateEvent.json";
import mappingToGenerateEvent_WithOrgUnit from "./data/mapping/mappingToGenerateEvent_WithOrgUnit.json";
import mappingToGenerateEvent_WithOptions from "./data/mapping/mappingToGenerateEvent_WithOptions.json";
import mappingToGenerateEvent_WithGlobalOptions from "./data/mapping/mappingToGenerateEvent_WithGlobalOptions.json";
import mappingProgram_Disabled from "./data/mapping/mappingProgram_Disabled.json";
import mappingToGenerateEvent_WithOrgUnit_Disabled from "./data/mapping/mappingToGenerateEvent_WithOrgUnit_Disabled.json";
import mappingToGenerateEvent_WithDisabledTEAtt from "./data/mapping/mappingToGenerateEvent_WithDisabledTEAtt.json";
import mappingToGenerateEvent_WithDisabledOption from "./data/mapping/mappingToGenerateEvent_WithDisabledOption.json";
import mappingToGenerateEvent_WithDisabledGlobalOptions from "./data/mapping/mappingToGenerateEvent_WithDisabledGlobalOptions.json";

import destinationTwoTrackerPrograms from "./data/programs/destinationTwoTrackerPrograms.json";
import destinationTwoEventPrograms from "./data/programs/destinationTwoEventPrograms.json";
import destinatioOneTrackerProgramAndOneEventProgram from "./data/programs/destinatioOneTrackerProgramAndOneEventProgram.json";

import emptyEvents from "./data/expected/emptyEvents.json";
import twoEventsWithAllValues from "./data/expected/twoEventsWithAllValues.json";
import oneEventWithValues from "./data/expected/oneEventWithValues.json";
import oneEvent_WithMappedOrgUnit from "./data/expected/oneEvent_WithMappedOrgUnit.json";
import oneEvent_WithMappedOptions from "./data/expected/oneEvent_WithMappedOptions.json";

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
        const teiMapper = createTEIsToEventPayloadMapper(mappingPrograms, destinationTwoEventPrograms as ProgramRef[]);

        const payload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(emptyEvents);
    });
    it("should return two events if two tracker programs are mapped to event programs and exist TE Att to DE mapping", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent,
            destinationTwoEventPrograms as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(twoEventsWithAllValues);
    });
    it("should return one event if one tracker program is mapped to event program and exist TE Att to DE mapping", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(oneEventWithValues);
    });
    it("should return one event with a mapped org unit if mapping contains org unit", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent_WithOrgUnit,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(oneEvent_WithMappedOrgUnit);
    });
    it("should return one event with mapped option as value if mapping contains options", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent_WithOptions,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(oneEvent_WithMappedOptions);
    });
    it("should return one event with mapped option as value if global mapping contains options", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent_WithGlobalOptions,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(oneEvent_WithMappedOptions);
    });
    it("should return empty events if mapping contains disabled programs", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingProgram_Disabled,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(emptyEvents);
    });
    it("should return empty events if mapping contains disabled org unit", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent_WithOrgUnit_Disabled,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(emptyEvents);
    });
    it("should return empty events if mapping contains disabled the unique TE attribute to DE in the event", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent_WithDisabledTEAtt,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(emptyEvents);
    });
    it("should return empty events if mapping contains disabled option in the unique TE attribute to DE in the event", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent_WithDisabledOption,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(emptyEvents);
    });
    it("should return empty events if mapping contains disabled global option for the unique TE attribute to DE in the event", async () => {
        const teiMapper = createTEIsToEventPayloadMapper(
            mappingToGenerateEvent_WithDisabledGlobalOptions,
            destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
        );

        const teisPayload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = (await teiMapper.map(teisPayload)) as EventsPackage;

        expect(mappedPayload).toEqual(emptyEvents);
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
