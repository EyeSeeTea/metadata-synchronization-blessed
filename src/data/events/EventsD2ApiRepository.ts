import { EventsPostResponse } from "@eyeseetea/d2-api/api/events";
import _ from "lodash";
import moment from "moment";
import {
    DataImportParams,
    DataSynchronizationParams,
} from "../../domain/aggregated/entities/DataSynchronizationParams";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { EventsPackage } from "../../domain/events/entities/EventsPackage";
import { ProgramEvent } from "../../domain/events/entities/ProgramEvent";
import { EventsRepository } from "../../domain/events/repositories/EventsRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { SynchronizationResult, SynchronizationStats } from "../../domain/reports/entities/SynchronizationResult";
import { cleanObjectDefault, cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { D2Api } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";

export class EventsD2ApiRepository implements EventsRepository {
    private api: D2Api;

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public async getEvents(
        params: DataSynchronizationParams,
        programStageIds: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        const { allEvents = false, orgUnitPaths = [] } = params;

        if (!allEvents) {
            return this.getSpecificEvents(params, programStageIds, defaults);
        } else if (allEvents && orgUnitPaths.length < 25) {
            return this.getEventsByOrgUnit(params, programStageIds, defaults);
        } else {
            return this.getAllEvents(params, programStageIds, defaults);
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
        programStageIds: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        if (programStageIds.length === 0) return [];

        const { period, orgUnitPaths = [], lastUpdated } = params;
        const { startDate, endDate } = buildPeriodFromParams(params);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        const fetchApi = async (orgUnit: string, page: number) => {
            return this.api.events
                .get({
                    pageSize: 250,
                    totalPages: true,
                    page,
                    orgUnit,
                    startDate: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                    endDate: period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
                    lastUpdated: lastUpdated ? moment(lastUpdated).format("YYYY-MM-DD") : undefined,
                })
                .getData();
        };

        const result = await promiseMap(orgUnits, async orgUnit => {
            const { events, pager } = await fetchApi(orgUnit, 1);

            const paginatedEvents = await promiseMap(_.range(2, pager.pageCount + 1), async page => {
                const { events } = await fetchApi(orgUnit, page);
                return events;
            });

            return [...events, ..._.flatten(paginatedEvents)];
        });

        return _(result)
            .flatten()
            .filter(({ programStage }) => programStageIds.includes(programStage))
            .map(object => ({ ...object, id: object.event }))
            .map(object => cleanObjectDefault(object, defaults))
            .value();
    }

    private async getEventsByOrgUnit(
        params: DataSynchronizationParams,
        programStageIds: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        if (programStageIds.length === 0) return [];

        const { period, orgUnitPaths = [], lastUpdated } = params;
        const { startDate, endDate } = buildPeriodFromParams(params);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        const fetchApi = async (programStage: string, orgUnit: string, page: number) => {
            return this.api.events
                .get({
                    pageSize: 250,
                    totalPages: true,
                    page,
                    programStage,
                    orgUnit,
                    startDate: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                    endDate: period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
                    lastUpdated: lastUpdated ? moment(lastUpdated).toISOString() : undefined,
                })
                .getData();
        };

        const result = await promiseMap(programStageIds, async programStage => {
            const filteredEvents = await promiseMap(orgUnits, async orgUnit => {
                const { events, pager } = await fetchApi(programStage, orgUnit, 1);

                const paginatedEvents = await promiseMap(_.range(2, pager.pageCount + 1), async page => {
                    const { events } = await fetchApi(programStage, orgUnit, page);
                    return events;
                });

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
        programStageIds: string[] = [],
        defaults: string[] = []
    ): Promise<ProgramEvent[]> {
        const { orgUnitPaths = [], events: filter = [] } = params;
        if (programStageIds.length === 0 || filter.length === 0) return [];

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);
        const result = [];

        for (const programStage of programStageIds) {
            for (const ids of _.chunk(filter, 300)) {
                const { events } = await this.api.events
                    .getAll({
                        programStage,
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

    public async save(data: EventsPackage, params: DataImportParams = {}): Promise<SynchronizationResult> {
        try {
            const { response } = await this.api.events
                .postAsync(
                    {
                        idScheme: params.idScheme ?? "UID",
                        dataElementIdScheme: params.dataElementIdScheme ?? "UID",
                        orgUnitIdScheme: params.orgUnitIdScheme ?? "UID",
                        dryRun: params.dryRun ?? false,
                        preheatCache: params.preheatCache ?? false,
                        skipExistingCheck: params.skipExistingCheck ?? false,
                    },
                    data
                )
                .getData();

            const result = await this.api.system.waitFor(response.jobType, response.id).getData();

            if (!result) {
                return {
                    status: "ERROR",
                    instance: this.instance.toPublicObject(),
                    date: new Date(),
                    type: "events",
                };
            }

            return this.cleanEventsImportResponse(result);
        } catch (error: any) {
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
        const errors = _(importResult.importSummaries)
            .flatMap(element => {
                if (element.status !== "ERROR") return undefined;
                return (
                    element.conflicts?.map(({ object, value }) => ({
                        id: element.reference ?? "",
                        message: _([element.description, object, value]).compact().join(" "),
                    })) ?? [{ id: element.reference ?? "", message: element.description }]
                );
            })
            .compact()
            .value();

        const stats: SynchronizationStats = _.pick(importResult, [
            "imported",
            "updated",
            "ignored",
            "deleted",
            "total",
        ]);

        return {
            status: importResult.status,
            stats,
            instance: this.instance.toPublicObject(),
            errors,
            date: new Date(),
            type: "events",
        };
    }
}
