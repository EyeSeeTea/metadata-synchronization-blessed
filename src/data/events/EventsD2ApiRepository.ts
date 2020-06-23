import _ from "lodash";
import { DataSynchronizationParams } from "../../domain/aggregated/types";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { ProgramEvent } from "../../domain/events/entities/ProgramEvent";
import { EventsRepository } from "../../domain/events/repositories/EventsRepository";
import { Instance as InstanceEntity } from "../../domain/instance/entities/Instance";
import {
    SynchronizationResult,
    SynchronizationStats,
} from "../../domain/synchronization/entities/SynchronizationResult";
import { cleanObjectDefault, cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import Instance from "../../models/instance";
import { DataImportParams } from "../../types/d2";
import { D2Api } from "../../types/d2-api";

export class EventsD2ApiRepository implements EventsRepository {
    private api: D2Api;

    constructor(instance: InstanceEntity) {
        this.api = new D2Api({ baseUrl: instance.url, auth: instance.auth });
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
            const { events: response } = (await this.api
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
        instance: Instance
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

        const errors = response.importSummaries.flatMap(
            ({ reference = "", description = "", conflicts = [] }) =>
                conflicts.map(({ object, value }) => ({
                    id: reference,
                    message: _([description, object, value])
                        .compact()
                        .join(" "),
                }))
        );

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
            instance: instance.toObject(),
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
        importSummaries: {
            description?: string;
            reference: string;
            conflicts?: {
                object: string;
                value: string;
            }[];
        }[];
    };
}
