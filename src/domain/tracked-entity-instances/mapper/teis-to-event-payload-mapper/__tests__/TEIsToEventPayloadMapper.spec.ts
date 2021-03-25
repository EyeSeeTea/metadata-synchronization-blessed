import { TEIsPackage } from "../../../entities/TEIsPackage";
import { TEIsToEventPayloadMapper } from "../TEIsToEventPayloadMapper";
import { ProgramRef } from "../../Models";

import teiWithTwoPrograms from "./data/tei/teiWithTwoPrograms.json";

import mappingPrograms from "./data/mapping/mappingPrograms.json";

import destinationTwoTrackerPrograms from "./data/programs/destinationTwoTrackerPrograms.json";
import destinationTwoEventPrograms from "./data/programs/destinationTwoEventPrograms.json";

import emptyEvents from "./data/expected/emptyEvents.json";

describe("TEIsToEventPayloadMapper", () => {
    it("should return empty events if tracker programs are mapped to tracker programs", async () => {
        const teiMapper = new TEIsToEventPayloadMapper(
            mappingPrograms,
            destinationTwoTrackerPrograms as ProgramRef[]
        );

        const payload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(emptyEvents);
    });
    it("should return empty events if tracker programs are mapped to event programs but not exist TE Att to DE mapping", async () => {
        const teiMapper = new TEIsToEventPayloadMapper(
            mappingPrograms,
            destinationTwoEventPrograms as ProgramRef[]
        );

        const payload = teiWithTwoPrograms as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(emptyEvents);
    });
    // it("should return one enrollments and programOwners if only one tracker program is mapped to a tracker program", async () => {
    //     const teiMapper = new TEIsPayloadMapper(
    //         mappingTwoTrackerPrograms,
    //         destinatioOneTrackerProgramAndOneEventProgram as ProgramRef[]
    //     );

    //     const payload = teiWithTwoPrograms as TEIsPackage;

    //     const mappedPayload = await teiMapper.map(payload);

    //     expect(mappedPayload).toEqual(teiWithTwoProgramsMapToOneTracker);
    // });
    // it("should return remove enrollments, programOwners and attributes if one tracker program is mapped to event program", async () => {
    //     const teiMapper = new TEIsPayloadMapper(
    //         mappingTwoTrackerPrograms,
    //         destinationTwoEventPrograms as ProgramRef[]
    //     );

    //     const payload = teiWithTwoPrograms as TEIsPackage;

    //     const mappedPayload = await teiMapper.map(payload);

    //     expect(mappedPayload).toEqual(teiWithTwoProgramsMapAllToEvent);
    // });
});

export {};
