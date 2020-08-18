import { Transformation } from "../../domain/transformations/entities/Transformation";
import _ from "lodash";
import { Ref } from "../../types/d2-api";

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
                                    : "ON_UPDATE_AND_INSERT"
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
        name: "charts-params",
        apiVersion: 31,
        undo: ({ charts, ...rest }: any) => {
            const typeUndoMapping: Mapping = {
                YEAR_OVER_YEAR_LINE: "LINE",
                YEAR_OVER_YEAR_COLUMN: "COLUMN",
            };

            const relativePeriodsMapping: Mapping = {
                THIS_YEAR: "thisYear",
                LAST_YEAR: "lastYear",
                LAST_5_YEARS: "last5Years",
            };

            return {
                ...rest,
                charts: charts?.map(
                    (chart: Chart31): Chart30 => {
                        const [years, relativeYearlySeries] = _.partition(chart.yearlySeries, s =>
                            s.match(/^\d+/)
                        );

                        return {
                            ..._.omit(chart, ["yearlySeries"]),
                            type: typeUndoMapping[chart.type] || chart.type,
                            relativePeriods: {
                                ..._(chart.relativePeriods)
                                    .mapValues(() => false)
                                    .value(),
                                ..._(relativeYearlySeries)
                                    .filter(s => _.has(relativePeriodsMapping, s))
                                    .map(s => [relativePeriodsMapping[s], true])
                                    .fromPairs()
                                    .value(),
                            },
                            periods: years.map(year => ({ id: year })),
                        };
                    }
                ),
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
                    const {
                        paramGrandParentOrganisationUnit: grandParentOrganisationUnit,
                        paramParentOrganisationUnit: parentOrganisationUnit,
                        paramReportingPeriod: reportingPeriod,
                        paramOrganisationUnit: organisationUnit,
                        ...restReportParams
                    } = reportParams;

                    return {
                        ...rest,
                        visualization: reportTable,
                        reportParams: {
                            ...restReportParams,
                            grandParentOrganisationUnit,
                            parentOrganisationUnit,
                            reportingPeriod,
                            organisationUnit,
                        },
                    };
                }),
            };
        },
        undo: ({ reports, ...rest }: any) => {
            return {
                ...rest,
                reports: reports?.map(({ visualization, reportParams = {}, ...rest }: any) => {
                    const {
                        grandParentOrganisationUnit: paramGrandParentOrganisationUnit,
                        parentOrganisationUnit: paramParentOrganisationUnit,
                        reportingPeriod: paramReportingPeriod,
                        organisationUnit: paramOrganisationUnit,
                        ...restReportParams
                    } = reportParams;

                    return {
                        ...rest,
                        reportTable: visualization,
                        reportParams: {
                            ...restReportParams,
                            paramGrandParentOrganisationUnit,
                            paramParentOrganisationUnit,
                            paramReportingPeriod,
                            paramOrganisationUnit,
                        },
                    };
                }),
            };
        },
    },
];

type Mapping = _.Dictionary<string | undefined>;

interface Chart30 {
    type: string;
    relativePeriods: _.Dictionary<boolean>;
    periods: Ref[];
}

interface Chart31 extends Chart30 {
    yearlySeries: string[];
}

export const aggregatedTransformations: Transformation[] = [];

export const eventsTransformations: Transformation[] = [];
