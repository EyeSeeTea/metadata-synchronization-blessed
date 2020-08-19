import { sync } from "./helpers";

describe("Sync metadata", () => {
    beforeAll(() => {
        jest.setTimeout(30000);
    });

    it("Transforms report params (2.33 -> 2.34)", async () => {
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

        const { reports } = await sync({ from: "2.33", to: "2.34", metadata, models: ["reports"] });
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

    it("Transforms dashboard items (2.33 -> 2.34)", async () => {
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
            from: "2.33",
            to: "2.34",
            metadata,
            models: ["dashboards"],
        });
        const dashboard = dashboards["dashboard1"];
        expect(dashboard).toBeDefined();

        const [item] = dashboard?.dashboardItems;
        expect(item).toBeDefined();

        expect(item.type).toEqual("VISUALIZATION");
        expect(item.visualization, "to keep referencing the chart").toEqual({
            id: "v7g3iMUFcsD",
        });
        expect(item.chart, "is no longer set").toBeUndefined();
    });

    it("Transforms dashboard items (2.34 -> 2.33)", async () => {
        const metadata = {
            dashboards: [
                {
                    id: "dashboard1",
                    dashboardItems: [
                        {
                            id: "item1",
                            type: "VISUALIZATION",
                            visualization: { id: "chart1" },
                        },
                        {
                            id: "item2",
                            type: "VISUALIZATION",
                            visualization: { id: "reportTable1" },
                        },
                    ],
                },
            ],
            visualizations: [
                {
                    id: "chart1",
                    type: "LINE",
                },
                {
                    id: "reportTable1",
                    type: "PIVOT_TABLE",
                },
            ],
        };

        const { dashboards } = await sync({
            from: "2.34",
            to: "2.33",
            metadata,
            models: ["dashboards"],
        });
        const dashboard = dashboards["dashboard1"];
        expect(dashboard).toBeDefined();

        const [chartItem] = dashboard?.dashboardItems;
        expect(chartItem).toBeDefined();

        expect(chartItem.type).toEqual("CHART");
        expect(chartItem.chart, "to reference the chart").toEqual({
            id: "chart1",
        });
        expect(chartItem.visualization, "is no longer set").toBeUndefined();
    });
});

export {};
