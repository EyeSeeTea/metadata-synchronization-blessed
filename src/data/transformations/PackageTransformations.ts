import { Transformation } from "../../domain/transformations/entities/Transformation";

export const metadataTransformations: Transformation[] = [
    {
        name: "add user roles under user directly",
        apiVersion: 38,
        apply: ({ users, ...rest }: any) => {
            return {
                ...rest,
                users: users?.map((user: any) => ({ ...user, userRoles: user.userCredentials.userRoles })) || undefined,
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
        apply: ({ eventCharts, eventReports, ...rest }: any) => {
            const eventVisualizations = [...(eventCharts || []), ...(eventReports || [])];

            return {
                ...rest,
                eventVisualizations,
            };
        },
    },
];

export const aggregatedTransformations: Transformation[] = [];

export const eventsTransformations: Transformation[] = [];
