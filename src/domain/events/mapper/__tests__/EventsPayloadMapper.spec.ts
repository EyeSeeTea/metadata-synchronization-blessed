import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { EventsPayloadMapper } from "../EventsPayloadMapper";
import { ProgramStageRef } from "../Models";

import singleEvent from "./data/events/singleEvent.json";
import singleEventCatOptions2 from "./data/events/singleEvent_cat_options_2.json";

import originCategoryOptionCombos from "./data/category_option_combos/origin.json";
import destinationCategoryOptionCombos from "./data/category_option_combos/destination.json";

import mappingOrgUnits from "./data/mapping/mapping_orgUnits.json";
import mappingDisabledOrgUnits from "./data/mapping/mapping_disabled_orgUnits.json";
import mappingProgram from "./data/mapping/mapping_program.json";
import mappingProgramstage from "./data/mapping/mapping_program_program_stage.json";
import mappingDisabledProgram from "./data/mapping/mapping_disabled_program.json";
import mappingDataElement from "./data/mapping/mapping_dataelement.json";
import mappingDataElementAndGlobalDataElement from "./data/mapping/mapping_dataelement_and_global_dataelement.json";
import mappingDisabledDataElement from "./data/mapping/mapping_disabled_dataelement.json";
import mappingDisabledGlobalDataElement from "./data/mapping/mapping_disabled_global_dataelement.json";
import mappingGlobalDataElement from "./data/mapping/mapping_global_dataelement.json";
import mappingOptions from "./data/mapping/mapping_options.json";
import mappingOptionByValue from "./data/mapping/mapping_option_by_value.json";
import mappingGlobalOptionByValue from "./data/mapping/mapping_global_option_by_value.json";
import mappingOptionsAndGlobalOptions from "./data/mapping/mapping_options_and_global_options.json";
import mappingGlobalOptions from "./data/mapping/mapping_global_options.json";
import mappingDisabledOptions from "./data/mapping/mapping_disabled_options.json";
import mappingDisabledGlobalOptions from "./data/mapping/mapping_disabled_global_options.json";
import mappingTrackerProgramStage from "./data/mapping/mapping_tracker_program_stage.json";
import mappingDiabledTrackerProgramStage from "./data/mapping/mapping_disabled_tracker_program_stage.json";
import mappingProgramCategoryOptions1to1 from "./data/mapping/mapping_program_category_options_1_1.json";
import mappingGlobalCategoryOptions1to1 from "./data/mapping/mapping_global_category_options_1_1.json";
import mappingProgramCategoryOptions2to2 from "./data/mapping/mapping_program_category_options_2_2.json";
import mappingGlobalCategoryOptions2to2 from "./data/mapping/mapping_global_category_options_2_2.json";
import mappingProgramCategoryOptions2to1 from "./data/mapping/mapping_program_category_options_2_1.json";
import mappingGlobalCategoryOptions2to1 from "./data/mapping/mapping_global_category_options_2_1.json";
import mappingAggregatedDataElement from "./data/mapping/mapping_aggregated_dataelement.json";

import emptyEvents from "./data/expected/empty_events.json";
import eventWithoutMapping from "./data/expected/event_without_mapping.json";
import eventOrgUnitsMapping from "./data/expected/event_orgUnits_mapping.json";
import eventProgramMapping from "./data/expected/event_program_mapping.json";
import eventProgramStageMapping from "./data/expected/event_program_program_stage_mapping.json";
import eventDataElementMapping from "./data/expected/event_dataelement_mapping.json";
import eventGlobalDataElementMapping from "./data/expected/event_global_dataelement_mapping.json";
import eventOptionsMapping from "./data/expected/event_options_mapping.json";
import eventOptionsMappingByValue from "./data/expected/event_options_mapping_by_value.json";
import eventOptionsGlobalMappingByValue from "./data/expected/event_options_global_mapping_by_value.json";
import eventGlobalOptionsMapping from "./data/expected/event_global_options_mapping.json";
import eventDisabledDataElementMapping from "./data/expected/event_disabled_dataelement_mapping.json";
import eventDisabledOptionsMapping from "./data/expected/event_disabled_options_mapping.json";
import eventProgramCategoryOption1To1Mapping from "./data/expected/event_program_category_options_1_1_mapping.json";
import eventGlobalCategoryOption1To1Mapping from "./data/expected/event_global_category_options_1_1_mapping.json";
import eventProgramCategoryOption2To2Mapping from "./data/expected/event_program_category_options_2_2_mapping.json";
import eventGlobalCategoryOption2To2Mapping from "./data/expected/event_program_category_options_2_2_mapping.json";
import eventProgramCategoryOption2To1Mapping from "./data/expected/event_program_category_options_2_1_mapping.json";
import eventGlobalCategoryOption2To1Mapping from "./data/expected/event_global_category_options_2_1_mapping.json";
import trackerProgramStageMapping from "./data/expected/event_program_stage_mapping.json";

import eventAggregatedDataElementMapping from "./data/expected/event_aggregated_dataelement_mapping.json";

import emptyTrackerProgramStages from "./data/destination_tracker_programs_stages/empty_tracker_program_stages.json";
import trackerProgramStage from "./data/destination_tracker_programs_stages/tracker_program_stage.json";

describe("EventsPayloadMapper", () => {
    describe("event program and tracker program", () => {
        it("should return the expected payload if mapping is empty", async () => {
            const eventMapper = createEventsPayloadMapper({}, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventWithoutMapping);
        });
        it("should return the payload with mapped orgUnit if mapping contain orgUnits", async () => {
            const eventMapper = createEventsPayloadMapper(mappingOrgUnits, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventOrgUnitsMapping);
        });
        it("should return the payload with empty events if mapping contain orgUnits but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledOrgUnits, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(emptyEvents);
        });
        it("should return the payload with mapped program if mapping contain event programs", async () => {
            const eventMapper = createEventsPayloadMapper(mappingProgram, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventProgramMapping);
        });
        it("should return the payload with mapped event program stage if mapping contain event program stage", async () => {
            const eventMapper = createEventsPayloadMapper(mappingProgramstage, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventProgramStageMapping);
        });
        it("should return the payload with empty events if mapping contain programs but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledProgram, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(emptyEvents);
        });
        it("should return the payload with mapped data element if mapping contain data element", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDataElement, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventDataElementMapping);
        });
        it("should return the payload with mapped data element by program if mapping contain data element and global data element", async () => {
            const eventMapper = createEventsPayloadMapper(
                mappingDataElementAndGlobalDataElement,
                emptyTrackerProgramStages
            );

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventDataElementMapping);
        });
        it("should return the payload with global mapped data element by program if mapping contain global data element", async () => {
            const eventMapper = createEventsPayloadMapper(mappingGlobalDataElement, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventGlobalDataElementMapping);
        });
        it("should return the payload without the data value of disabled data element if mapping contain data element but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledDataElement, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventDisabledDataElementMapping);
        });
        it("should return the payload without the data value of disabled global data element if mapping contain global data element but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledGlobalDataElement, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventDisabledDataElementMapping);
        });
        it("should return the payload with mapped option value if mapping contain option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingOptions, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventOptionsMapping);
        });
        it("should return the payload with mapped option by value if mapping contain option by value", async () => {
            const eventMapper = createEventsPayloadMapper(mappingOptionByValue, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventOptionsMappingByValue);
        });
        it("should return the payload with global mapped option by value if mapping contain global option by value", async () => {
            const eventMapper = createEventsPayloadMapper(mappingGlobalOptionByValue, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventOptionsGlobalMappingByValue);
        });
        it("should return the payload with mapped option value by DE if mapping contain option and global option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingOptionsAndGlobalOptions, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventOptionsMapping);
        });
        it("should return the payload with global mapped option value if mapping contain global option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingGlobalOptions, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventGlobalOptionsMapping);
        });
        it("should return the payload without the data value of disabled option if mapping contain option but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledOptions, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventDisabledOptionsMapping);
        });
        it("should return the payload without the data value of disabled global option if mapping contain global option but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDisabledGlobalOptions, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventDisabledOptionsMapping);
        });
        it("should return the payload with the expected tracker program stage if mapping contain tracker program stage", async () => {
            const eventMapper = createEventsPayloadMapper(mappingTrackerProgramStage, trackerProgramStage);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(trackerProgramStageMapping);
        });
        it("should return the payload with empty events if mapping contain tracker program stage but disabled", async () => {
            const eventMapper = createEventsPayloadMapper(mappingDiabledTrackerProgramStage, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(emptyEvents);
        });
        it("should return the payload with the expected attributeOptionCombo if mapping contain 1 to 1 category option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingProgramCategoryOptions1to1, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventProgramCategoryOption1To1Mapping);
        });
        it("should return the payload with the expected attributeOptionCombo if mapping contain global 1 to 1 category option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingGlobalCategoryOptions1to1, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventGlobalCategoryOption1To1Mapping);
        });
        it("should return the payload with the expected attributeOptionCombo if mapping contain 2 to 2 category option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingProgramCategoryOptions2to2, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEventCatOptions2);

            expect(mappedPayload).toEqual(eventProgramCategoryOption2To2Mapping);
        });
        it("should return the payload with the expected attributeOptionCombo if mapping contain global 2 to 2 category option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingGlobalCategoryOptions2to2, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEventCatOptions2);

            expect(mappedPayload).toEqual(eventGlobalCategoryOption2To2Mapping);
        });
        it("should return the payload with the expected attributeOptionCombo if mapping contain 2 to 1 category option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingProgramCategoryOptions2to1, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEventCatOptions2);

            expect(mappedPayload).toEqual(eventProgramCategoryOption2To1Mapping);
        });
        it("should return the payload with the expected attributeOptionCombo if mapping contain global 2 to 1 category option", async () => {
            const eventMapper = createEventsPayloadMapper(mappingGlobalCategoryOptions2to1, emptyTrackerProgramStages);

            const mappedPayload = await eventMapper.map(singleEventCatOptions2);

            expect(mappedPayload).toEqual(eventGlobalCategoryOption2To1Mapping);
        });
        it("should return the payload with mapped aggregated data element if mapping contain aggregated data element", async () => {
            const eventMapper = createEventsPayloadMapper(
                mappingAggregatedDataElement as MetadataMappingDictionary,
                emptyTrackerProgramStages
            );

            const mappedPayload = await eventMapper.map(singleEvent);

            expect(mappedPayload).toEqual(eventAggregatedDataElementMapping);
        });
    });
});

function createEventsPayloadMapper(
    mapping: MetadataMappingDictionary,
    destinationProgramstages: ProgramStageRef[]
): EventsPayloadMapper {
    return new EventsPayloadMapper(
        mapping,
        originCategoryOptionCombos,
        destinationCategoryOptionCombos,
        "XfXL6fEveof",
        destinationProgramstages
    );
}
