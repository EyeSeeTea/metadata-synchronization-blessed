import { DataSynchronizationParams } from "../../domain/aggregated/types";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { Instance } from "../../domain/instance/entities/Instance";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { TrackedEntityInstance } from "../../domain/tracked-entity-instances/entities/TrackedEntityInstance";
import { TEIRepository } from "../../domain/tracked-entity-instances/repositories/TEIRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";

export class TEID2ApiRepository implements TEIRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }
    async getTEIs(
        params: DataSynchronizationParams,
        program: string
    ): Promise<TrackedEntityInstance[]> {
        const { period, orgUnitPaths = [] } = params;
        const { startDate, endDate } = buildPeriodFromParams(params);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return [];

        const result = await this.api
            .get<TEIsResponse>("/trackedEntityInstances", {
                program,
                ou: orgUnits.join(";"),
                //Specify fields because without fields enrollment relation is not in response
                //and if assign fiedls: "*" return events inside enrollments
                fields:
                    "trackedEntityInstance, created,orgUnit,createdAtClient,lastUpdated,trackedEntityType,lastUpdatedAtClient,inactive,deleted,featureType,programOwners,enrollments,relationships,attributes",
                programStartDate: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                programEndDate: period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
            })
            .getData();

        return result.trackedEntityInstances;
    }

    // async save(
    //     data: TrackedEntityInstance[],
    //     additionalParams: DataImportParams | undefined
    // ): Promise<SynchronizationResult> {
    // try {
    //     const response = await this.api
    //         .post<EventsPostResponse>(
    //             "/events",
    //             {
    //                 idScheme: "UID",
    //                 dataElementIdScheme: "UID",
    //                 orgUnitIdScheme: "UID",
    //                 eventIdScheme: "UID",
    //                 preheatCache: false,
    //                 skipExistingCheck: false,
    //                 format: "json",
    //                 async: false,
    //                 dryRun: false,
    //                 ...additionalParams,
    //             },
    //             data
    //         )
    //         .getData();

    //     return this.cleanEventsImportResponse(response);
    // } catch (error) {
    //     if (error?.response?.data) {
    //         return this.cleanEventsImportResponse(error.response.data);
    //     }

    //     return {
    //         status: "NETWORK ERROR",
    //         instance: this.instance.toPublicObject(),
    //         date: new Date(),
    //         type: "events",
    //     };
    // }
    //  }

    // private cleanEventsImportResponse(importResult: EventsPostResponse): SynchronizationResult {
    //     const { status, message, response } = importResult;

    //     const errors =
    //         response.importSummaries?.flatMap(
    //             ({ reference = "", description = "", conflicts }) =>
    //                 conflicts?.map(({ object, value }) => ({
    //                     id: reference,
    //                     message: _([description, object, value]).compact().join(" "),
    //                 })) ?? [{ id: reference, message: description }]
    //         ) ?? [];

    //     const stats: SynchronizationStats = _.pick(response, [
    //         "imported",
    //         "updated",
    //         "ignored",
    //         "deleted",
    //         "total",
    //     ]);

    //     return {
    //         status,
    //         message,
    //         stats,
    //         instance: this.instance.toPublicObject(),
    //         errors,
    //         date: new Date(),
    //         type: "events",
    //     };
    // }
}

// interface EventsPostResponse {
//     status: "SUCCESS" | "ERROR";
//     message?: string;
//     response: {
//         imported: number;
//         updated: number;
//         deleted: number;
//         ignored: number;
//         total: number;
//         importSummaries?: {
//             description?: string;
//             reference: string;
//             conflicts?: {
//                 object: string;
//                 value: string;
//             }[];
//         }[];
//     };
//}

interface TEIsResponse {
    trackedEntityInstances: TrackedEntityInstance[];
}
