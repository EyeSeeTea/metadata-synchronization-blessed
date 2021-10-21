import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { EventsPackage } from "../../entities/EventsPackage";
import { EventsPayloadMapper } from "../EventsPayloadMapper";
import { ProgramStageRef } from "../Models";

import singleEvent from "./data/event_program/events/singleEvent.json";

import mappingOrgUnits from "./data/event_program/mapping/mapping_orgUnits.json";
import mappingDisabledOrgUnits from "./data/event_program/mapping/mapping_disabled_orgUnits.json";
import mappingProgram from "./data/event_program/mapping/mapping_program.json";
import mappingDisabledProgram from "./data/event_program/mapping/mapping_disabled_program.json";
import mappingDataElement from "./data/event_program/mapping/mapping_dataelement.json";
import mappingDisabledDataElement from "./data/event_program/mapping/mapping_disabled_dataelement.json";

import eventWithoutMapping from "./data/event_program/expected/event_without_mapping.json";
import eventOrgUnitsMapping from "./data/event_program/expected/event_orgUnits_mapping.json";
import eventProgramMapping from "./data/event_program/expected/event_program_mapping.json";
import eventDataElementMapping from "./data/event_program/expected/event_dataelement_mapping.json";
import eventDisabledDataElementMapping from "./data/event_program/expected/event_disabled_dataelement_mapping.json";
import emptyEvents from "./data/event_program/expected/empty_events.json";

describe("EventsPayloadMapper", () => {
    describe("event program", () => {
        it("should return the same payload if mapping is empty", async () => {
            const eventMapper = createEventsPayloadMapper({}, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventWithoutMapping);
        });
        it("should return the payload with mapped orgUnit if mapping contain orgUnits", async () => {
            const eventMapper = createEventsPayloadMapper(mappingOrgUnits, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventOrgUnitsMapping);
        });
        it("should return the payload with empty events if mapping contain orgUnits but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledOrgUnits, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(emptyEvents);
        });
        it("should return the payload with mapped program if mapping contain event programs", async () => {
            const eventMapper = createEventsPayloadMapper(mappingProgram, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventProgramMapping);
        });
        it("should return the payload with empty events if mapping contain programs but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledProgram, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(emptyEvents);
        });
        it("should return the payload with mapped data element if mapping contain data element", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDataElement, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventDataElementMapping);
        });
        it("should return the payload without the data value of disabled data element if mapping contain data element but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledDataElement, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventDisabledDataElementMapping);
        });
    });
    describe("tracker program", () => {});
});

function createEventsPayloadMapper(
    mapping: MetadataMappingDictionary,
    destinationProgramstages: ProgramStageRef[]
): EventsPayloadMapper {
    return new EventsPayloadMapper(mapping, [], [], "def4UultPRGS", destinationProgramstages);
}
