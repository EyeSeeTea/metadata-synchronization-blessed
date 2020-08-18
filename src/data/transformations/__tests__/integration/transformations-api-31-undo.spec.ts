import { Request, Server } from "miragejs";
import _ from "lodash";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { startDhis } from "../../../../../config/dhisServer";
import { executeMetadataSync } from "./helpers";

describe("Sync metadata 31->30", () => {
    let local: Server;
    let remote: Server;

    beforeAll(() => {
        jest.setTimeout(30000);
    });

    beforeEach(() => {
        local = startDhis({ urlPrefix: "http://origin.test" }, { version: "2.31" });
        remote = startDhis(
            { urlPrefix: "http://destination.test", pretender: local.pretender },
            { version: "2.30" }
        );

        local.get("/metadata", async () => ({
            charts: [
                {
                    id: "chart-line",
                    type: "LINE",
                    relativePeriods: { last12Weeks: true, last4Quarters: false },
                    yearlySeries: ["2016", "THIS_YEAR", "LAST_YEAR", "2018", "LAST_5_YEARS"],
                },
                {
                    id: "chart-over-column",
                    type: "YEAR_OVER_YEAR_COLUMN",
                },
            ],
        }));

        remote.get("/metadata", async () => ({}));

        local.get("/dataStore/metadata-synchronization/instances", async () => [
            {
                id: "DESTINATION",
                name: "Destination test",
                url: remote.urlPrefix,
                username: "test",
                password: "",
                description: "",
            },
        ]);

        const addMetadataToDb = async (schema: Schema<AnyRegistry>, request: Request) => {
            schema.db.metadata.insert(JSON.parse(request.requestBody));

            return {
                status: "OK",
                stats: { created: 1, updated: 0, deleted: 0, ignored: 0, total: 1 },
                typeReports: [],
            };
        };

        local.db.createCollection("metadata", []);
        local.post("/metadata", addMetadataToDb);

        remote.db.createCollection("metadata", []);
        remote.post("/metadata", addMetadataToDb);
    });

    afterEach(() => {
        local.shutdown();
        remote.shutdown();
    });

    it("Transforms charts of type chart-over-line/chart-over-column (2.31 -> 2.30)", async () => {
        const { charts } = await executeMetadataSync(local, remote, ["charts"]);

        expect(charts["chart-line"]?.type).toEqual("LINE");
        expect(charts["chart-over-line"]?.type).toEqual("LINE");
        expect(charts["chart-over-column"]?.type).toEqual("COLUMN");
    });

    it("Transforms charts yearly series to relative and absolute periods (2.31 -> 2.30)", async () => {
        const { charts } = await executeMetadataSync(local, remote, ["charts"]);

        const chartLine = charts["chart-line"];
        expect(chartLine).toBeDefined();

        expect(chartLine).not.toHaveProperty("yearlySeries");

        expect(
            chartLine.relativePeriods,
            "to be set from yearlySeries for keys thisYear/lastYear/last5Years"
        ).toMatchObject({
            thisYear: true,
            lastYear: true,
            last5Years: true,
        });

        expect(chartLine.relativePeriods, "to be set to false for other values").toMatchObject({
            last12Weeks: false,
            last4Quarters: false,
        });

        expect(chartLine.periods, "to contain the absolute years from yearlySeries").toEqual([
            { id: "2016" },
            { id: "2018" },
        ]);
    });
});

export {};
