import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { EventsPackage } from "../../entities/EventsPackage";
import { EventsPayloadMapper } from "../EventsPayloadMapper";
import { ProgramStageRef } from "../Models";

import singleEvent from "./data/event_program/events/singleEvent.json";

import mappingOrgUnits from "./data/event_program/mapping/mapping_orgUnits.json";
import mappingDisabledOrgUnits from "./data/event_program/mapping/mapping_disabled_orgUnits.json";
import mappingProgram from "./data/event_program/mapping/mapping_program.json";
import mappingProgramstage from "./data/event_program/mapping/mapping_program_program_stage.json";
import mappingDisabledProgram from "./data/event_program/mapping/mapping_disabled_program.json";
import mappingDataElement from "./data/event_program/mapping/mapping_dataelement.json";
import mappingDataElementAndGlobalDataElement from "./data/event_program/mapping/mapping_dataelement_and_global_dataelement.json";
import mappingDisabledDataElement from "./data/event_program/mapping/mapping_disabled_dataelement.json";
import mappingDisabledGlobalDataElement from "./data/event_program/mapping/mapping_disabled_global_dataelement.json";
import mappingGlobalDataElement from "./data/event_program/mapping/mapping_global_dataelement.json";
import mappingOptions from "./data/event_program/mapping/mapping_options.json";
import mappingOptionsAndGlobalOptions from "./data/event_program/mapping/mapping_options_and_global_options.json";
import mappingGlobalOptions from "./data/event_program/mapping/mapping_global_options.json";
import mappingDisabledOptions from "./data/event_program/mapping/mapping_disabled_options.json";
import mappingDisabledGlobalOptions from "./data/event_program/mapping/mapping_disabled_global_options.json";
import mappingProgramCategoryOptions from "./data/event_program/mapping/mapping_program_category_options.json";

import emptyEvents from "./data/event_program/expected/empty_events.json";
import eventWithoutMapping from "./data/event_program/expected/event_without_mapping.json";
import eventOrgUnitsMapping from "./data/event_program/expected/event_orgUnits_mapping.json";
import eventProgramMapping from "./data/event_program/expected/event_program_mapping.json";
import eventProgramStageMapping from "./data/event_program/expected/event_program_program_stage_mapping.json";
import eventDataElementMapping from "./data/event_program/expected/event_dataelement_mapping.json";
import eventGlobalDataElementMapping from "./data/event_program/expected/event_global_dataelement_mapping.json";
import eventOptionsMapping from "./data/event_program/expected/event_options_mapping.json";
import eventGlobalOptionsMapping from "./data/event_program/expected/event_global_options_mapping.json";
import eventDisabledDataElementMapping from "./data/event_program/expected/event_disabled_dataelement_mapping.json";
import eventDisabledOptionsMapping from "./data/event_program/expected/event_disabled_options_mapping.json";
import eventProgramCategoryOptionMapping from "./data/event_program/expected/event_program_category_options_mapping.json";

describe("EventsPayloadMapper", () => {
    describe("event program and tracker program", () => {
        it("should return the expected payload if mapping is empty", async () => {
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
        it("should return the payload with mapped program stage if mapping contain program stage", async () => {
            const eventMapper = createEventsPayloadMapper(mappingProgramstage, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventProgramStageMapping);
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
        it("should return the payload with mapped data element by program if mapping contain data element and global data element", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDataElementAndGlobalDataElement, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventDataElementMapping);
        });
        it("should return the payload with global mapped data element by program if mapping contain global data element", async () => {
            const eventMapper = createEventsPayloadMapper(mappingGlobalDataElement, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventGlobalDataElementMapping);
        });
        it("should return the payload without the data value of disabled data element if mapping contain data element but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledDataElement, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventDisabledDataElementMapping);
        });
        it("should return the payload without the data value of disabled global data element if mapping contain global data element but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledGlobalDataElement, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventDisabledDataElementMapping);
        });
        it("should return the payload with mapped option value if mapping contain option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingOptions, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventOptionsMapping);
        });
        it("should return the payload with mapped option value by DE if mapping contain option and global option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingOptionsAndGlobalOptions, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventOptionsMapping);
        });
        it("should return the payload with global mapped option value if mapping contain global option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingGlobalOptions, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventGlobalOptionsMapping);
        });
        it("should return the payload without the data value of disabled option if mapping contain option but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledOptions, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventDisabledOptionsMapping);
        });
        it("should return the payload without the data value of disabled global option if mapping contain global option but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledGlobalOptions, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventDisabledOptionsMapping);
        });
        it("should return the payload with the expected attributeOptionCombo if mapping contain category option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingProgramCategoryOptions, []);

            const payload = singleEvent as EventsPackage;

            const mappedPayload = await eventMapper.map(payload);

            expect(mappedPayload).toEqual(eventProgramCategoryOptionMapping);
        });
    });
    describe("tracker program", () => {});
});

function createEventsPayloadMapper(
    mapping: MetadataMappingDictionary,
    destinationProgramstages: ProgramStageRef[]
): EventsPayloadMapper {
    const originCategoryOptionCombos = [
        {
            name: "default",
            id: "XfXL6fEveof",
            categoryCombo: {
                id: "bjDvmb4bfuf",
            },
            categoryOptions: [
                {
                    id: "xYerKDKCefk",
                },
            ],
        },
    ];

    const destinationCategoryOptionCombos = [
        {
            name: "default",
            id: "Xr12mI7VPn3",
            categoryCombo: {
                id: "JzvGfLYkX17",
            },
            categoryOptions: [
                {
                    id: "Y7fcspgsU43",
                },
            ],
        },
    ];

    return new EventsPayloadMapper(
        mapping,
        originCategoryOptionCombos,
        destinationCategoryOptionCombos,
        "XfXL6fEveof",
        destinationProgramstages
    );
}
