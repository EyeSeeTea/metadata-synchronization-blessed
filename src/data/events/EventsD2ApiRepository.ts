import _ from "lodash";
import { DataSynchronizationParams } from "../../domain/aggregated/types";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { ProgramEvent } from "../../domain/events/entities/ProgramEvent";
import { EventsRepository } from "../../domain/events/repositories/EventsRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import {
    SynchronizationResult,
    SynchronizationStats,
} from "../../domain/synchronization/entities/SynchronizationResult";
import { cleanObjectDefault, cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { DataImportParams } from "../../types/d2";
import { D2Api, Pager } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";

export class EventsD2ApiRepository implements EventsRepository {
    private api: D2Api;

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public async getEvents(
        params: DataSynchronizationParams,
        programs: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        const { allEvents = false, orgUnitPaths = [] } = params;

        if (!allEvents) {
            return this.getSpecificEvents(params, programs, defaults);
        } else if (allEvents && orgUnitPaths.length < 25) {
            return this.getEventsByOrgUnit(params, programs, defaults);
        } else {
            return this.getAllEvents(params, programs, defaults);
        }
    }

    /**
     * Design choices and heads-up:
     *  - The events endpoint does not support multiple values for a given filter
     *    meaning you cannot query for multiple programs or multiple orgUnits in
     *    the same API call. Instead you need to query one by one
     *  - Querying one by one is not performant, instead we query for all events
     *    available in the instance and manually filter them in this method
     *  - For big databases querying for all events available in a given instance
     *    with paging=false makes the instance to eventually go offline
     *  - Instead of disabling paging we traverse all the events by paginating all
     *    the available pages so that we can filter them afterwards
     */
    private async getAllEvents(
        params: DataSynchronizationParams,
        programs: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        if (programs.length === 0) return [];

        const { period, orgUnitPaths = [] } = params;
        const [startDate, endDate] = buildPeriodFromParams(params);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        const fetchApi = async (program: string, page: number) => {
            return this.api
                .get<EventExportResult>("/events", {
                    pageSize: 250,
                    totalPages: true,
                    page,
                    program,
                    startDate: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                    endDate: period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
                })
                .getData();
        };

        const result = await promiseMap(programs, async program => {
            const { events, pager } = await fetchApi(program, 1);

            const paginatedEvents = await promiseMap(
                _.range(2, pager.pageCount + 1),
                async page => {
                    const { events } = await fetchApi(program, page);
                    return events;
                }
            );

            return [...events, ..._.flatten(paginatedEvents)];
        });

        return _(result)
            .flatten()
            .filter(({ orgUnit }) => orgUnits.includes(orgUnit))
            .map(object => ({ ...object, id: object.event }))
            .map(object => cleanObjectDefault(object, defaults))
            .value();
    }

    private async getEventsByOrgUnit(
        params: DataSynchronizationParams,
        programs: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        if (programs.length === 0) return [];

        const { period, orgUnitPaths = [] } = params;
        const [startDate, endDate] = buildPeriodFromParams(params);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        const fetchApi = async (program: string, orgUnit: string, page: number) => {
            return this.api
                .get<EventExportResult>("/events", {
                    pageSize: 250,
                    totalPages: true,
                    page,
                    program,
                    orgUnit,
                    startDate: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                    endDate: period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
                })
                .getData();
        };

        const result = await promiseMap(programs, async program => {
            const filteredEvents = await promiseMap(orgUnits, async orgUnit => {
                const { events, pager } = await fetchApi(program, orgUnit, 1);

                const paginatedEvents = await promiseMap(
                    _.range(2, pager.pageCount + 1),
                    async page => {
                        const { events } = await this.api
                            .get<EventExportResult>("/events", {
                                pageSize: 250,
                                totalPages: true,
                                page,
                                program,
                                startDate:
                                    period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                                endDate:
                                    period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
                            })
                            .getData();
                        return events;
                    }
                );

                return [...events, ..._.flatten(paginatedEvents)];
            });

            return _.flatten(filteredEvents);
        });

        return _(result)
            .flatten()
            .map(object => ({ ...object, id: object.event }))
            .map(object => cleanObjectDefault(object, defaults))
            .value();
    }

    private async getSpecificEvents(
        params: DataSynchronizationParams,
        programs: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        const { orgUnitPaths = [], events: filter = [] } = params;
        if (programs.length === 0 || filter.length === 0) return [];

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);
        const result = [];

        for (const program of programs) {
            for (const ids of _.chunk(filter, 300)) {
                const { events } = await this.api
                    .get<EventExportResult>("/events", {
                        paging: false,
                        program,
                        event: ids.join(";"),
                    })
                    .getData();
                result.push(...events);
            }
        }

        return _(result)
            .filter(({ orgUnit }) => orgUnits.includes(orgUnit))
            .map(object => ({ ...object, id: object.event }))
            .map(object => cleanObjectDefault(object, defaults))
            .value();
    }

    public async save(
        data: object,
        additionalParams: DataImportParams | undefined
    ): Promise<SynchronizationResult> {
        try {
            const response = await this.api
                .post<EventsPostResponse>(
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

            return this.cleanEventsImportResponse(response);
        } catch (error) {
            if (error?.response?.data) {
                return this.cleanEventsImportResponse(error.response.data);
            }

            return {
                status: "NETWORK ERROR",
                instance: this.instance.toPublicObject(),
                date: new Date(),
                type: "events",
            };
        }
    }

    private cleanEventsImportResponse(importResult: EventsPostResponse): SynchronizationResult {
        const { status, message, response } = importResult;

        const errors =
            response.importSummaries?.flatMap(
                ({ reference = "", description = "", conflicts }) =>
                    conflicts?.map(({ object, value }) => ({
                        id: reference,
                        message: _([description, object, value]).compact().join(" "),
                    })) ?? [{ id: reference, message: description }]
            ) ?? [];

        const stats: SynchronizationStats = _.pick(response, [
            "imported",
            "updated",
            "ignored",
            "deleted",
            "total",
        ]);

        return {
            status,
            message,
            stats,
            instance: this.instance.toPublicObject(),
            errors,
            date: new Date(),
            type: "events",
        };
    }
}

interface EventsPostResponse {
    status: "SUCCESS" | "ERROR";
    message?: string;
    response: {
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

type EventExportType = ProgramEvent & { event: string };
interface EventExportResult {
    events: EventExportType[];
    pager: Pager;
}
