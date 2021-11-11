import { sync } from "./helpers";

import visualizations30 from "./data/visualizations-30.json";
import visualizations34 from "./data/visualizations-34.json";

describe("API 34", () => {
    beforeAll(() => {
        jest.setTimeout(30000);
    });

    describe("Transformation 2.30 -> 2.34", () => {
        it("Transforms report params", async () => {
            const metadata = {
                reports: [
                    {
                        id: "id1",
                        name: "Test Severity Report",
                        type: "HTML",
                        cacheStrategy: "RESPECT_SYSTEM_SETTING",
                        reportParams: {
                            paramGrandParentOrganisationUnit: false,
                            paramReportingPeriod: true,
                            paramOrganisationUnit: true,
                            paramParentOrganisationUnit: false,
                        },
                    },
                ],
            };

            const { reports } = await sync({
                from: "2.30",
                to: "2.34",
                metadata,
                models: ["reports"],
            });
            const report = reports["id1"];
            expect(report).toBeDefined();

            expect(report.type).toEqual("HTML");

            const { reportParams } = report;
            expect(reportParams).toBeDefined();

            // Assert new properties have the correct values
            expect(reportParams.grandParentOrganisationUnit).toEqual(false);
            expect(reportParams.reportingPeriod).toEqual(true);
            expect(reportParams.organisationUnit).toEqual(true);
            expect(reportParams.parentOrganisationUnit).toEqual(false);

            // Assert old properties are not anymore
            expect(reportParams.paramGrandParentOrganisationUnit).toBeUndefined();
            expect(reportParams.paramReportingPeriod).toBeUndefined();
            expect(reportParams.paramOrganisationUnit).toBeUndefined();
            expect(reportParams.paramParentOrganisationUnit).toBeUndefined();
        });

        it("Transforms dashboard items", async () => {
            const metadata = {
                dashboards: [
                    {
                        id: "dashboard1",
                        dashboardItems: [
                            {
                                id: "item1",
                                type: "CHART",
                                chart: { id: "v7g3iMUFcsD" },
                            },
                        ],
                    },
                ],
            };

            const { dashboards } = await sync({
                from: "2.30",
                to: "2.34",
                metadata,
                models: ["dashboards"],
            });
            const dashboard = dashboards["dashboard1"];
            expect(dashboard).toBeDefined();

            const [item] = dashboard?.dashboardItems;
            expect(item).toBeDefined();

            expect(item.type).toEqual("VISUALIZATION");
            expect(item.visualization).toEqual({
                id: "v7g3iMUFcsD",
            });
            expect(item.chart).toBeUndefined();
        });

        it("Transforms charts and report tables to visualizations", async () => {
            const payload = await sync({
                from: "2.30",
                to: "2.34",
                metadata: visualizations30,
                models: ["visualizations"],
            });

            expect(payload.visualizations["LW0O27b7TdD"]).toMatchObject(visualizations34.visualizations[0]);

            expect(payload.visualizations["qfMh2IjOxvw"]).toMatchObject(visualizations34.visualizations[1]);
        });
    });

    describe("Transformation 2.34 -> 2.30", () => {
        it("Transforms dashboard items", async () => {
            const metadata = {
                dashboards: [
                    {
                        id: "dashboard1",
                        dashboardItems: [
                            {
                                id: "item1",
                                type: "VISUALIZATION",
                                visualization: { id: "chart1", type: "LINE" },
                            },
                            {
                                id: "item2",
                                type: "VISUALIZATION",
                                visualization: { id: "reportTable1", type: "PIVOT_TABLE" },
                            },
                            {
                                id: "item3",
                                type: "MAP",
                                map: { id: "map1" },
                            },
                        ],
                    },
                ],
            };

            const { dashboards } = await sync({
                from: "2.34",
                to: "2.30",
                metadata,
                models: ["dashboards"],
            });

            const dashboard = dashboards["dashboard1"];
            expect(dashboard).toBeDefined();
            expect(dashboard?.dashboardItems).toHaveLength(3);
            const [chartItem, reportTableItem, mapItem] = dashboard?.dashboardItems;

            // Chart item
            expect(chartItem).toBeDefined();

            expect(chartItem.type).toEqual("CHART");
            expect(chartItem.chart).toEqual({
                id: "chart1",
                type: "LINE",
            });
            expect(chartItem.visualization).toBeUndefined();

            // Report table item
            expect(reportTableItem).toBeDefined();

            expect(reportTableItem.type).toEqual("REPORT_TABLE");
            expect(reportTableItem.reportTable).toEqual({
                id: "reportTable1",
                type: "PIVOT_TABLE",
            });
            expect(reportTableItem.visualization).toBeUndefined();

            // Other item
            expect(mapItem).toBeDefined();

            expect(mapItem.type).toEqual("MAP");
            expect(mapItem.map).toEqual({
                id: "map1",
            });
            expect(mapItem.visualization).toBeUndefined();
        });

        it("Transforms visualizations into charts and report tables", async () => {
            const payload = await sync({
                from: "2.34",
                to: "2.30",
                metadata: visualizations34,
                models: ["charts", "reportTables"],
            });

            expect(payload.charts["LW0O27b7TdD"]).toMatchObject(visualizations30.charts[0]);

            expect(payload.reportTables["qfMh2IjOxvw"]).toMatchObject(visualizations30.reportTables[0]);
        });
    });
});

export {};
