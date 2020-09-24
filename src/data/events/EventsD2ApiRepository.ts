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

export class EventsD2ApiRepository implements EventsRepository {
    private api: D2Api;

    constructor(private instance: Instance) {
        this.api = new D2Api({ baseUrl: instance.url, auth: instance.auth });
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
    public async getEvents(
        params: DataSynchronizationParams,
        programs: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        const { period, orgUnitPaths = [], events: filter = [], allEvents } = params;
        const [startDate, endDate] = buildPeriodFromParams(params);

        if (programs.length === 0) return [];

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        const result = [];

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

        for (const program of programs) {
            const { events, pager } = await fetchApi(program, 1);
            result.push(...events);

            for (let page = 2; page <= pager.pageCount; page += 1) {
                const { events } = await fetchApi(program, page);
                result.push(...events);
            }
        }

        return _(result)
            .filter(({ orgUnit }) => orgUnits.includes(orgUnit))
            .filter(({ event }) => (allEvents ? true : filter.includes(event)))
            .map(object => ({ ...object, id: object.event }))
            .map(object => cleanObjectDefault(object, defaults))
            .value();
    }

    public async save(
        data: object,
        additionalParams: DataImportParams | undefined
    ): Promise<SynchronizationResult> {
        const { status, message, response } = await this.api
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

        const errors =
            response.importSummaries?.flatMap(
                ({ reference = "", description = "", conflicts = [] }) =>
                    conflicts.map(({ object, value }) => ({
                        id: reference,
                        message: _([description, object, value]).compact().join(" "),
                    }))
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

interface EventExportResult {
    events: Array<ProgramEvent & { event: string }>;
    pager: Pager;
}
