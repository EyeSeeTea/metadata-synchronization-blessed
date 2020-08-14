import { Transformation } from "../../domain/transformations/entities/Transformation";

export const metadataTransformations: Transformation[] = [
    {
        name: "programStages-params",
        apiVersion: 31,
        apply: ({ programStages, ...rest }: any) => {
            return {
                programStages: programStages?.map(({ validCompleteOnly, ...rest }: any) => {
                    const validationStrategy = validCompleteOnly
                        ? "ON_UPDATE_AND_INSERT"
                        : "ON_COMPLETE";
                    return { validationStrategy, ...rest };
                }),
                ...rest,
            };
        },
        undo: ({ programStages, ...rest }: any) => {
            return {
                programStages: programStages?.map(({ validationStrategy, ...rest }: any) => {
                    const validCompleteOnly =
                        validationStrategy === "ON_UPDATE_AND_INSERT" ? true : false;
                    return { validCompleteOnly, ...rest };
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

export const aggregatedTransformations: Transformation[] = [];

export const eventsTransformations: Transformation[] = [];
