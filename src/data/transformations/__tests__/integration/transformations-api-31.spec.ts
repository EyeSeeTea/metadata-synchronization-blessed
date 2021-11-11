import { sync, SyncResult } from "./helpers";

let payload: SyncResult;

describe("Transformations for 2.30 -> 2.31", () => {
    const metadata = {
        programs: [
            {
                id: "id1",
                name: "Test tracker program",
                captureCoordinates: true,
            },
            {
                id: "id2",
                name: "Test tracker program",
                captureCoordinates: false,
            },
        ],
        programStages: [
            {
                id: "ps_id1",
                name: "Test programStage",
                validCompleteOnly: false,
            },
            {
                id: "ps_id2",
                name: "Test programStage",
                validCompleteOnly: true,
            },
        ],
    };

    beforeAll(async () => {
        jest.setTimeout(30000);

        payload = await sync({
            from: "2.30",
            to: "2.31",
            metadata,
            models: ["programs", "programStages"],
        });
    });

    describe("programs", () => {
        it("Local server to remote - program captureCoordinates true to featureType POINT - API 30 to API 31", async () => {
            const program = payload.programs["id1"];
            expect(program).toBeDefined();
            expect(program.name).toEqual("Test tracker program");

            // Assert new properties have the correct values
            expect(program.featureType).toEqual("POINT");

            // Assert old properties are not anymore
            expect(program.captureCoordinates).toBeUndefined();
        });

        it("Local server to remote - program captureCoordinates false to featureType NONE - API 30 to API 31", async () => {
            const program = payload.programs["id2"];
            expect(program).toBeDefined();

            expect(program.name).toEqual("Test tracker program");

            // Assert new properties have the correct values
            expect(program.featureType).toEqual("NONE");

            // Assert old properties are not anymore
            expect(program.captureCoordinates).toBeUndefined();
        });

        it("Local server to remote - programStage validCompleteOnly false to validationStrategy -> ON_COMPLETE - API 30 to API 31", async () => {
            const programStage = payload.programStages["ps_id1"];
            expect(programStage).toBeDefined();

            expect(programStage.name).toEqual("Test programStage");

            // Assert new properties have the correct values
            expect(programStage.validationStrategy).toEqual("ON_COMPLETE");

            // Assert old properties are not anymore
            expect(programStage.validCompleteOnly).toBeUndefined();
        });

        it("Local server to remote - programStage validCompleteOnly true to validationStrategy -> ON_COMPLETE - API 30 to API 31", async () => {
            const programStage = payload.programStages["ps_id2"];
            expect(programStage).toBeDefined();

            expect(programStage.name).toEqual("Test programStage");

            // Assert new properties have the correct values
            expect(programStage.validationStrategy).toEqual("ON_COMPLETE");

            // Assert old properties are not anymore
            expect(programStage.validCompleteOnly).toBeUndefined();
        });
    });
});

describe("Transformations for 2.31 -> 2.30", () => {
    const metadata = {
        charts: [
            {
                id: "chart-line",
                type: "LINE",
                relativePeriods: { last12Weeks: true, last4Quarters: false },
                yearlySeries: ["2016", "THIS_YEAR", "LAST_YEAR", "2018", "LAST_5_YEARS"],
            },
            {
                id: "chart-over-line",
                type: "YEAR_OVER_YEAR_LINE",
            },
            {
                id: "chart-over-column",
                type: "YEAR_OVER_YEAR_COLUMN",
            },
        ],
    };

    beforeAll(async () => {
        payload = await sync({
            from: "2.31",
            to: "2.30",
            metadata,
            models: ["charts"],
        });
    });

    it("Transforms charts of type chart-over-line/chart-over-column", async () => {
        const { charts } = payload;

        expect(charts["chart-line"]?.type).toEqual("LINE");
        expect(charts["chart-over-line"]?.type).toEqual("LINE");
        expect(charts["chart-over-column"]?.type).toEqual("COLUMN");
    });

    it("Transforms charts yearly series to relative and absolute periods", async () => {
        const { charts } = payload;
        const chartLine = charts["chart-line"];
        expect(chartLine).toBeDefined();

        expect(chartLine.relativePeriods).toMatchObject({
            thisYear: true,
            lastYear: true,
            last5Years: true,
        });

        expect(chartLine.relativePeriods).toMatchObject({
            last12Weeks: true,
            last4Quarters: false,
        });

        expect(chartLine.periods).toEqual([{ id: "2016" }, { id: "2018" }]);
    });
});

export {};
