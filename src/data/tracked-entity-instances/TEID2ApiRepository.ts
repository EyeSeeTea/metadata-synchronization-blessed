import _ from "lodash";
import {
    DataImportParams,
    DataSynchronizationParams,
    isDataSynchronizationRequired,
} from "../../domain/aggregated/entities/DataSynchronizationParams";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { Instance } from "../../domain/instance/entities/Instance";
import {
    SynchronizationResult,
    SynchronizationStats,
    SynchronizationStatus,
} from "../../domain/reports/entities/SynchronizationResult";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { TEIsPackage } from "../../domain/tracked-entity-instances/entities/TEIsPackage";
import { TrackedEntityInstance } from "../../domain/tracked-entity-instances/entities/TrackedEntityInstance";
import { TEIRepository, TEIsResponse } from "../../domain/tracked-entity-instances/repositories/TEIRepository";
import { D2Api } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";

export class TEID2ApiRepository implements TEIRepository {
    private api: D2Api;

    //Specify fields because without fields enrollment relation is not in response
    //and if assign fiedls: "*" return events inside enrollments
    private fields =
        "trackedEntityInstance, created,orgUnit,createdAtClient,lastUpdated,trackedEntityType,lastUpdatedAtClient,inactive,deleted,featureType,programOwners,enrollments,relationships,attributes";

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    async getAllTEIs(params: DataSynchronizationParams, programs: string[]): Promise<TrackedEntityInstance[]> {
        const result = await promiseMap(programs, async program => {
            const { trackedEntityInstances, pager } = await this.getTEIs(params, program, 1, 250);

            const paginatedTEIs = await promiseMap(_.range(2, pager.pageCount + 1), async page => {
                const { trackedEntityInstances } = await this.getTEIs(params, program, page, 250);
                return trackedEntityInstances;
            });

            return [...trackedEntityInstances, ..._.flatten(paginatedTEIs)];
        });

        return _(result)
            .flatten()
            .filter(object => isDataSynchronizationRequired(params, object.lastUpdated))
            .value();
    }

    async getTEIs(
        params: DataSynchronizationParams,
        program: string,
        page: number,
        pageSize: number
    ): Promise<TEIsResponse> {
        const { period, orgUnitPaths = [] } = params;
        const { startDate, endDate } = buildPeriodFromParams(params);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0)
            return {
                trackedEntityInstances: [],
                pager: {
                    pageCount: 1,
                    pageSize,
                    total: 0,
                    page,
                },
            };

        const result = await this.api
            .get<TEIsResponse>("/trackedEntityInstances", {
                program,
                ou: orgUnits.join(";"),
                fields: this.fields,
                programStartDate: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                programEndDate:
                    period !== "ALL" && period !== "SINCE_LAST_SUCCESSFUL_SYNC"
                        ? endDate.format("YYYY-MM-DD")
                        : undefined,
                totalPages: true,
                page,
                pageSize,
            })
            .getData();

        return { ...result };
    }

    async getTEIsById(params: DataSynchronizationParams, ids: string[]): Promise<TrackedEntityInstance[]> {
        const { orgUnitPaths = [] } = params;
        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return [];
        if (ids.length === 0) return [];

        const result = await this.api
            .get<TEIsResponse>("/trackedEntityInstances", {
                fields: this.fields,
                ou: orgUnits.join(";"),
                trackedEntityInstance: ids.join(";"),
            })
            .getData();

        return result.trackedEntityInstances;
    }

    async save(data: TEIsPackage, additionalParams: DataImportParams | undefined): Promise<SynchronizationResult> {
        try {
            const response = await this.api
                .post<TEIsPostResponse>(
                    "/trackedEntityInstances",
                    {
                        idScheme: "UID",
                        dataElementIdScheme: "UID",
                        orgUnitIdScheme: "UID",
                        format: "json",
                        dryRun: false,
                        ...additionalParams,
                        strategy: "CREATE_AND_UPDATE",
                        ignoreEmptyCollection: true,
                    },
                    data
                )
                .getData();

            return this.cleanTEIsImportResponse(response);
        } catch (error: any) {
            if (error?.response?.data) {
                return this.cleanTEIsImportResponse(error.response.data);
            }

            return {
                status: "NETWORK ERROR",
                instance: this.instance.toPublicObject(),
                date: new Date(),
                type: "events",
            };
        }
    }

    private cleanTEIsImportResponse(importResult: TEIsPostResponse): SynchronizationResult {
        const { status, message, response } = importResult;

        const errors =
            response.importSummaries?.flatMap(
                ({ reference = "", description = "", conflicts }) =>
                    conflicts?.map(({ object, value }) => ({
                        id: reference,
                        message: _([description, object, value]).compact().join(" "),
                    })) ?? [{ id: reference, message: description }]
            ) ?? [];

        const stats: SynchronizationStats = _.pick(response, ["imported", "updated", "ignored", "deleted", "total"]);

        return {
            status,
            message,
            stats,
            instance: this.instance.toPublicObject(),
            errors,
            date: new Date(),
            type: "trackedEntityInstances",
            response: importResult,
        };
    }
}

interface TEIsPostResponse {
    status: SynchronizationStatus;
    message?: string;
    response: {
        status: SynchronizationStatus;
        imported: number;
        updated: number;
        deleted: number;
        ignored: number;
        total: number;
        importSummaries?: {
            description?: string;
            reference: string;
            conflicts?: {
                object: string;
                value: string;
            }[];
        }[];
    };
}
