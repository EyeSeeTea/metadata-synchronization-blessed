import _ from "lodash";
import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { EventsPackage } from "../../entities/EventsPackage";
import { EventsPayloadMapper } from "../EventsPayloadMapper";
import { ProgramStageRef } from "../Models";

import singleEvent from "./data/event_program/events/singleEvent.json";

import singleEventWithoutMapping from "./data/event_program/expected/singleEvent_without_mapping.json";

describe("EventsPayloadMapper", () => {
    describe("event program", () => {
        it("should return the same payload if mapping is empty", async () => {
            const eventMapper = createEventsPayloadMapper({}, []);
            
            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(singleEventWithoutMapping);
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
