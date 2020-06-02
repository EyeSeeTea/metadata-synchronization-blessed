import { AxiosError } from "axios";
import _ from "lodash";
import { DataSynchronizationParams } from "../../../domain/aggregated/types";
import { buildPeriodFromParams } from "../../../domain/aggregated/utils";
import { ProgramEvent } from "../../../domain/events/entities/ProgramEvent";
import { EventsRepository } from "../../../domain/events/repositories/EventsRepository";
import { cleanObjectDefault, cleanOrgUnitPaths } from "../../../domain/synchronization/utils";
import { DataImportParams, DataImportResponse, MetadataImportResponse } from "../../../types/d2";
import { D2Api } from "../../../types/d2-api";
import Instance from "../../../models/instance";
import { SyncRuleType } from "../../../types/synchronization";
import {
    SynchronizationResult,
    SynchronizationStats,
} from "../../../domain/synchronization/entities/SynchronizationResult";

export class EventsD2ApiRepository implements EventsRepository {
    private currentD2Api: D2Api;

    constructor(d2Api: D2Api) {
        this.currentD2Api = d2Api;
    }

    public async getEvents(
        params: DataSynchronizationParams,
        programs: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        const { period, orgUnitPaths = [], events = [], allEvents } = params;
        const [startDate, endDate] = buildPeriodFromParams(params);

        if (programs.length === 0) return [];

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        const result = [];

        for (const program of programs) {
            const { events: response } = (await this.currentD2Api
                .get("/events", {
                    paging: false,
                    program,
                    startDate: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                    endDate: period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
                })
                .getData()) as { events: (ProgramEvent & { event: string })[] };

            result.push(...response);
        }

        return _(result)
            .filter(({ orgUnit }) => orgUnits.includes(orgUnit))
            .filter(({ event }) => (allEvents ? true : events.includes(event)))
            .map(object => ({ ...object, id: object.event }))
            .map(object => cleanObjectDefault(object, defaults))
            .value();
    }

    public async save(
        data: object,
        additionalParams: DataImportParams | undefined,
        targetInstance: Instance
    ): Promise<SynchronizationResult> {
        try {
            const response = await this.currentD2Api
                .post<DataImportResponse>(
                    "/events",
                    {
                        idScheme: "UID",
                        dataElementIdScheme: "UID",
                        orgUnitIdScheme: "UID",
                        eventIdScheme: "UID",
                        preheatCache: false,
                        skipExistingCheck: false,
                        format: "json",
                        async: false,
                        dryRun: false,
                        ...additionalParams,
                    },
                    data
                )
                .getData();

            return this.cleanDataImportResponse(response, targetInstance, "events");
        } catch (error) {
            return this.cleanDataImportResponse(
                this.buildResponseError(error),
                targetInstance,
                "events"
            );
        }
    }

    private buildResponseError(error: AxiosError): MetadataImportResponse {
        if (error.response && error.response.data) {
            const {
                httpStatus = "Unknown",
                httpStatusCode = 400,
                message = "Request failed unexpectedly",
            } = error.response.data;
            return {
                ...error.response.data,
                message: `Error ${httpStatusCode} (${httpStatus}): ${message}`,
            };
        } else if (error.response) {
            const { status, statusText } = error.response;
            console.error(status, statusText, error);
            return { status: "ERROR", message: `Unknown error: ${status} ${statusText}` };
        } else {
            console.error(error);
            return { status: "NETWORK ERROR" };
        }
    }

    private cleanDataImportResponse(
        importResult: DataImportResponse,
        instance: Instance,
        type: SyncRuleType
    ): SynchronizationResult {
        const { status: importStatus, message, importCount, response, conflicts } = importResult;
        const status = importStatus === "OK" ? "SUCCESS" : importStatus;
        const aggregatedMessages = conflicts?.map(({ object, value }) => ({
            id: object,
            message: value,
        }));

        const eventsMessages = _.flatten(
            response?.importSummaries?.map(
                ({ reference = "", description = "", conflicts }) =>
                    conflicts?.map(({ object, value }) => ({
                        id: reference,
                        message: _([description, object, value])
                            .compact()
                            .join(" "),
                    })) ?? { id: reference, message: description }
            )
        );

        const stats: SynchronizationStats = {
            created: importCount?.imported ?? response?.imported ?? 0,
            deleted: importCount?.deleted ?? response?.deleted ?? 0,
            updated: importCount?.updated ?? response?.updated ?? 0,
            ignored: importCount?.ignored ?? response?.ignored ?? 0,
            total: 0,
        };

        return {
            status,
            message,
            stats,
            instance: instance.toObject(),
            errors: aggregatedMessages ?? eventsMessages ?? [],
            date: new Date(),
            type,
        };
    }
}
