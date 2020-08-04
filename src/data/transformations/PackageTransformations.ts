import { Transformation } from "../../domain/transformations/entities/Transformation";

export const metadataTransformations: Transformation[] = [
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
