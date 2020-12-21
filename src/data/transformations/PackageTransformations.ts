import { D2DashboardItem as D2DashboardItem33 } from "d2-api/2.33";
import _ from "lodash";
import { Transformation } from "../../domain/transformations/entities/Transformation";
import { debug } from "../../utils/debug";
import { isKeyOf, Mapping } from "./__tests__/integration/helpers";

export const metadataTransformations: Transformation[] = [
    {
        name: "orgunits-params",
        apiVersion: 32,
        apply: ({ organisationUnits, ...rest }: any) => {
            return {
                organisationUnits: organisationUnits?.map(
                    ({ featureType, coordinates, geometry, ...rest }: any) => {
                        if (featureType && featureType !== "NONE" && coordinates) {
                            try {
                                geometry = {
                                    type: _.startCase(featureType.toLowerCase()),
                                    coordinates: JSON.parse(coordinates),
                                };
                            } catch (error) {
                                console.log(
                                    "Error during coordinates conversion OU: " + rest["id"]
                                );
                            }
                        }
                        return _.pickBy({ geometry, ...rest }, _.identity);
                    }
                ),
                ...rest,
            };
        },
        undo: ({ organisationUnits, ...rest }: any) => {
            return {
                organisationUnits: organisationUnits?.map(
                    ({ geometry, featureType, coordinates, ...rest }: any) => {
                        if (geometry && geometry.type && geometry.coordinates) {
                            try {
                                featureType = geometry.type.toUpperCase();
                                coordinates = JSON.stringify(geometry.coordinates).replace(
                                    /"/g,
                                    ""
                                );
                            } catch (error) {
                                console.log(
                                    "Error during coordinates conversion OU: " + rest["id"]
                                );
                            }
                        }
                        return _.pickBy({ featureType, coordinates, ...rest }, _.identity);
                    }
                ),
                ...rest,
            };
        },
    },
    {
        name: "programStages-params",
        apiVersion: 31,
        apply: ({ programStages, ...rest }: any) => {
            return {
                programStages: programStages?.map(
                    ({ validCompleteOnly, validationStrategy, ...rest }: any) => {
                        validationStrategy =
                            typeof validationStrategy === "undefined"
                                ? validCompleteOnly
                                    ? "ON_COMPLETE"
                                    : "ON_COMPLETE"
                                : validationStrategy;
                        return { validationStrategy, ...rest };
                    }
                ),
                ...rest,
            };
        },
        undo: ({ programStages, ...rest }: any) => {
            return {
                programStages: programStages?.map(({ validationStrategy, ...rest }: any) => {
                    const validCompleteOnly =
                        validationStrategy === "ON_UPDATE_AND_INSERT" ? false : true;
                    return { validCompleteOnly, validationStrategy, ...rest };
                }),
                ...rest,
            };
        },
    },
    {
        name: "programs-params",
        apiVersion: 31,
        apply: ({ programs, ...rest }: any) => {
            return {
                programs: programs?.map(({ captureCoordinates, ...rest }: any) => {
                    const featureType = captureCoordinates ? "POINT" : "NONE";
                    return { featureType, ...rest };
                }),
                ...rest,
            };
        },
        undo: ({ programs, ...rest }: any) => {
            return {
                programs: programs?.map(({ featureType, ...rest }: any) => {
                    const captureCoordinates = featureType === "NONE" ? false : true;
                    return { captureCoordinates, featureType, ...rest };
                }),
                ...rest,
            };
        },
    },
    {
        name: "charts",
        apiVersion: 31,
        apply: ({ charts, ...rest }: any) => {
            return {
                ...rest,
                charts: charts?.map((chart: any) => {
                    return {
                        yearlySeries: [],
                        ...chart,
                    };
                }),
            };
        },
        undo: ({ charts, ...rest }: any) => {
            const typeUndoMapping: Mapping = {
                YEAR_OVER_YEAR_LINE: "LINE",
                YEAR_OVER_YEAR_COLUMN: "COLUMN",
            };

            return {
                ...rest,
                charts: charts?.map((chart: any) => {
                    return {
                        ...chart,
                        type: typeUndoMapping[chart.type] || chart.type,
                        ...getPeriodDataFromYearlySeries(chart),
                    };
                }),
            };
        },
    },
    {
        name: "dashboard-dashboardItems-visualization",
        apiVersion: 34,
        apply: ({ dashboards, ...rest }: any) => {
            return {
                ...rest,
                dashboards: dashboards?.map((dashboard: any) => {
                    const { dashboardItems } = dashboard;
                    return {
                        ...dashboard,
                        dashboardItems: _.compact(dashboardItems).map((dashboardItem: any) => {
                            const { type } = dashboardItem;
                            if (!isKeyOf(itemsMapping, type)) return dashboardItem;
                            const refField = itemsMapping[type];

                            return {
                                ..._.omit(dashboardItem, [refField]),
                                type: "VISUALIZATION",
                                visualization: dashboardItem[refField],
                            };
                        }),
                    };
                }),
            };
        },
        undo: ({ dashboards, visualizations, ...rest }: any) => {
            return {
                ...rest,
                visualizations,
                dashboards: _.compact(
                    dashboards?.map((dashboard: any) => {
                        const { dashboardItems } = dashboard;
                        return {
                            ...dashboard,
                            dashboardItems: dashboardItems?.map((dashboardItem: any) => {
                                const { type } = dashboardItem as { type: string };
                                if (type !== "VISUALIZATION" || !dashboardItem.visualization)
                                    return dashboardItem;
                                if (!visualizations) {
                                    debug("No visualization found");
                                    return null;
                                }

                                const visualization = visualizations.find(
                                    (v: { id: string }) => v.id === dashboardItem.visualization.id
                                ) as { type: string } | undefined;
                                if (
                                    !visualization ||
                                    !isKeyOf(visualizationTypeMapping, visualization.type)
                                )
                                    return dashboardItem;
                                const modelInfo = visualizationTypeMapping[visualization.type];

                                return {
                                    ..._.omit(dashboardItem, ["visualization"]),
                                    type: modelInfo.type,
                                    [modelInfo.property]: dashboardItem.visualization,
                                };
                            }),
                        };
                    })
                ),
            };
        },
    },
    {
        name: "charts-and-reportTables-to-visualizations",
        apiVersion: 34,
        apply: ({ charts, reportTables, ...rest }: any) => {
            const newCharts = charts?.map((chart: any) => {
                return {
                    regression: false,
                    colSubTotals: false,
                    colTotals: false,
                    digitGroupSeparator: "SPACE",
                    displayDensity: "NORMAL",
                    fontSize: "NORMAL",
                    rowSubTotals: false,
                    rowTotals: false,
                    hideEmptyColumns: false,
                    hideEmptyRows: false,
                    showDimensionLabels: false,
                    showHierarchy: false,
                    skipRounding: false,
                    reportingParams: {
                        parentOrganisationUnit: false,
                        reportingPeriod: false,
                        organisationUnit: false,
                        grandParentOrganisationUnit: false,
                    },
                    topLimit: 0,
                    ...chart,
                    series: undefined,
                    category: undefined,
                    seriesItems: undefined,
                    columnDimensions: _.compact([chart.series]),
                    rowDimensions: _.compact([chart.category]),
                    optionalAxes: (chart.seriesItems || []).map(({ series, axis }: any) => ({
                        dimensionalItem: series,
                        axis,
                    })),
                };
            });

            const newReportTables = reportTables?.map((reportTable: any) => {
                return {
                    yearlySeries: [],
                    percentStackedValues: false,
                    hideLegend: false,
                    noSpaceBetweenColumns: false,
                    showData: false,
                    optionalAxes: [],
                    ...reportTable,
                    type: "PIVOT_TABLE",
                    cumulative: undefined,
                    cumulativeValues: reportTable.cumulative,
                    reportParams: undefined,
                    reportingParams: getNewReportParams(reportTable.reportParams),
                };
            });

            return {
                ...rest,
                visualizations: _.compact(_.concat(newCharts, newReportTables)),
            };
        },
        undo: ({ visualizations, ...rest }: any) => {
            const [charts, reportTables] = _(visualizations)
                .partition(
                    (visualization: { type: string }) =>
                        isKeyOf(visualizationTypeMapping, visualization.type) &&
                        visualizationTypeMapping[visualization.type].type !== "REPORT_TABLE"
                )
                .value();

            const newCharts = charts.map((chart: any) => {
                return {
                    series: (chart.columnDimensions || [])[0],
                    category: (chart.rowDimensions || [])[0],
                    seriesItems: (chart.optionalAxes || []).map(
                        ({ dimensionalItem, axis }: any) => ({
                            series: dimensionalItem,
                            axis,
                        })
                    ),
                    ...chart,
                };
            });

            const newReportTables = reportTables.map((reportTable: any) => {
                return {
                    ...reportTable,
                    ...getPeriodDataFromYearlySeries(reportTable),
                    cumulativeValues: undefined,
                    cumulative: reportTable.cumulativeValues,
                    reportingParams: undefined,
                    reportParams: getOldReportParams(reportTable.reportingParams),
                };
            });

            return {
                ...rest,
                charts: newCharts,
                reportTables: newReportTables,
            };
        },
    },
    {
        name: "report-table-params",
        apiVersion: 34,
        apply: ({ reports, ...rest }: any) => {
            return {
                ...rest,
                reports: reports?.map(({ reportTable, reportParams = {}, ...rest }: any) => {
                    return {
                        ...rest,
                        visualization: reportTable,
                        reportParams: getNewReportParams(reportParams),
                    };
                }),
            };
        },
        undo: ({ reports, ...rest }: any) => {
            return {
                ...rest,
                reports: reports?.map(({ visualization, reportParams = {}, ...rest }: any) => {
                    return {
                        ...rest,
                        reportTable: visualization,
                        reportParams: getOldReportParams(reportParams),
                    };
                }),
            };
        },
    },
    {
        name: "maps with nested mapViews",
        apiVersion: 32,
        apply: ({ maps, mapViews, ...rest }: any) => {
            const newMapViews = mapViews?.map((mapView: any) => {
                return {
                    categoryDimensions: [],
                    filterDimensions: ["pe"],
                    ...mapView,
                };
            });

            const newMapViewsById = _.keyBy(newMapViews || [], mapView => mapView.id);

            return {
                ...rest,
                mapViews: newMapViews,
                maps: maps?.map((map: any) => {
                    return {
                        ...map,
                        mapViews: _(map.mapViews || [])
                            .map(mapViewRef => newMapViewsById[mapViewRef.id])
                            .compact()
                            .value(),
                    };
                }),
            };
        },
    },
    {
        name: "mapViews params",
        apiVersion: 33,
        apply: ({ mapViews, ...rest }: any) => {
            return {
                ...rest,
                mapViews: mapViews?.map((mapView: any) => {
                    return {
                        renderingStrategy: "SINGLE",
                        ...mapView,
                    };
                }),
            };
        },
    },
];

const itemsMapping = {
    CHART: "chart",
    REPORT_TABLE: "reportTable",
} as const;

const chart = { type: "CHART", property: "chart" } as const;
const reportTable = { type: "REPORT_TABLE", property: "reportTable" } as const;

const visualizationTypeMapping: Record<
    string,
    { type: D2DashboardItem33["type"]; property: keyof D2DashboardItem33 }
> = {
    COLUMN: chart,
    STACKED_COLUMN: chart,
    BAR: chart,
    STACKED_BAR: chart,
    LINE: chart,
    AREA: chart,
    PIE: chart,
    RADAR: chart,
    GAUGE: chart,
    YEAR_OVER_YEAR_LINE: chart,
    YEAR_OVER_YEAR_COLUMN: chart,
    SINGLE_VALUE: chart,
    PIVOT_TABLE: reportTable,
};

function getNewReportParams(reportParams: any) {
    const {
        paramGrandParentOrganisationUnit: grandParentOrganisationUnit,
        paramParentOrganisationUnit: parentOrganisationUnit,
        paramReportingPeriod: reportingPeriod,
        paramOrganisationUnit: organisationUnit,
        ...restReportParams
    } = reportParams || {};

    return {
        ...restReportParams,
        grandParentOrganisationUnit,
        parentOrganisationUnit,
        reportingPeriod,
        organisationUnit,
    };
}

function getOldReportParams(reportParams: any) {
    const {
        grandParentOrganisationUnit: paramGrandParentOrganisationUnit,
        parentOrganisationUnit: paramParentOrganisationUnit,
        reportingPeriod: paramReportingPeriod,
        organisationUnit: paramOrganisationUnit,
        ...restReportParams
    } = reportParams || {};

    return {
        ...restReportParams,
        paramGrandParentOrganisationUnit,
        paramParentOrganisationUnit,
        paramReportingPeriod,
        paramOrganisationUnit,
    };
}

function isNumber(s: string): boolean {
    return !!s.match(/^\d+/);
}

function getPeriodDataFromYearlySeries(object: any) {
    const [years, relativeYearlySeries] = _.partition(object.yearlySeries, isNumber);

    const relativePeriodsMapping: Mapping = {
        THIS_YEAR: "thisYear",
        LAST_YEAR: "lastYear",
        LAST_5_YEARS: "last5Years",
    };

    const periodsData = {
        relativePeriods: {
            ...object.relativePeriods,
            ..._(relativeYearlySeries)
                .filter(s => _.has(relativePeriodsMapping, s))
                .map(s => [relativePeriodsMapping[s], true])
                .fromPairs()
                .value(),
        },
        periods: years.map(year => ({ id: year })),
    };

    return periodsData;
}

export const aggregatedTransformations: Transformation[] = [];

export const eventsTransformations: Transformation[] = [];
