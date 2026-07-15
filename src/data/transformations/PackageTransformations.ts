import { Transformation } from "../../domain/transformations/entities/Transformation";

export const metadataTransformations: Transformation[] = [
    {
        name: "add user roles under user directly",
        apiVersion: 38,
        apply: ({ users, ...rest }: any) => {
            return {
                ...rest,
                users:
                    users?.map((user: any) => ({
                        ...user,
                        userRoles: user.userCredentials?.userRoles ?? user.userRoles,
                    })) || undefined,
            };
        },
    },
    {
        name: "eventCharts, eventReports missing in 2.41",
        apiVersion: 41,
        undo: ({ eventVisualizations, eventCharts, eventReports, ...rest }: any) => {
            const isEventReport = (visualizationType: string) =>
                visualizationType === "PIVOT_TABLE" || visualizationType === "LINE_LIST";

            const finalEventCharts = eventCharts
                ? eventCharts
                : eventVisualizations?.filter((eventVisualization: any) => !isEventReport(eventVisualization.type)) ||
                  [];
            const finalEventReports = eventReports
                ? eventReports
                : eventVisualizations?.filter((eventVisualization: any) => isEventReport(eventVisualization.type)) ||
                  [];

            return {
                ...rest,
                eventCharts: finalEventCharts,
                eventReports: finalEventReports,
            };
        },
        apply: ({ eventCharts, eventReports, eventVisualizations, ...rest }: any) => {
            const eventVisualizationsTransformation = [
                ...(eventCharts || []),
                ...(eventReports || []),
                ...(eventVisualizations || []),
            ];

            return {
                ...rest,
                eventVisualizations:
                    eventVisualizationsTransformation.length > 0 ? eventVisualizationsTransformation : undefined,
            };
        },
    },
];

export const teiTransformations: Transformation[] = [
    {
        name: "tei enrollment attributes must go at tei level only for >= 2.41",
        apiVersion: 41,
        apply: ({ trackedEntities, ...rest }: any) => {
            if (!trackedEntities) {
                return { ...rest };
            }

            // attributes already exist at tei level, and are expected only there in v41+
            const updatedTeis = trackedEntities.map((tei: any) => {
                return {
                    ...tei,
                    enrollments: tei.enrollments?.map((enrollment: any) => ({ ...enrollment, attributes: [] })),
                };
            });
            return { ...rest, trackedEntities: updatedTeis };
        },
    },
];
