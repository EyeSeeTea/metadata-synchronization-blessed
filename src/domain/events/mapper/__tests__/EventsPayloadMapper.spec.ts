import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { EventsPackage } from "../../entities/EventsPackage";
import { EventsPayloadMapper } from "../EventsPayloadMapper";
import { ProgramStageRef } from "../Models";

import singleEvent from "./data/event_program/events/singleEvent.json";

import mappingOrgUnits from "./data/event_program/mapping/mapping_orgUnits.json";
import mappingDisabledOrgUnits from "./data/event_program/mapping/mapping_disabled_orgUnits.json";

import singleEventWithoutMapping from "./data/event_program/expected/singleEvent_without_mapping.json";
import singleEventOrgUnitsMapping from "./data/event_program/expected/singleEvent_orgUnits_mapping.json";
import emptyEvents from "./data/event_program/expected/empty_events.json";

describe("EventsPayloadMapper", () => {
    describe("event program", () => {
        it("should return the same payload if mapping is empty", async () => {
            const eventMapper = createEventsPayloadMapper({}, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(singleEventWithoutMapping);
        });
        it("should return the payload with mapped orgUnit if mapping contain orgUnits", async () => {
            const eventMapper = createEventsPayloadMapper(mappingOrgUnits, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(singleEventOrgUnitsMapping);
        });
        it("should return the payload with empty events if mapping contain orgUnits but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledOrgUnits, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(emptyEvents);
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
