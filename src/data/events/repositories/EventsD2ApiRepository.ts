import { AxiosError } from "axios";
import _ from "lodash";
import { DataSynchronizationParams } from "../../../domain/aggregated/types";
import { buildPeriodFromParams } from "../../../domain/aggregated/utils";
import { ProgramEvent } from "../../../domain/events/entities/Events";
import { EventsRepository } from "../../../domain/events/repositories/EventsRepository";
import { cleanObjectDefault, cleanOrgUnitPaths } from "../../../domain/synchronization/utils";
import { DataImportParams, DataImportResponse, MetadataImportResponse } from "../../../types/d2";
import { D2Api } from "../../../types/d2-api";

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
        additionalParams?: DataImportParams
    ): Promise<DataImportResponse> {
        try {
            const response = await this.currentD2Api
                .post(
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

            return response as DataImportResponse;
        } catch (error) {
            return this.buildResponseError(error);
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
}
