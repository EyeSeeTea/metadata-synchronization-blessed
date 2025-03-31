import _ from "lodash";
import moment from "moment";
import {
    DataImportParams,
    DataSynchronizationParams,
    isDataSynchronizationRequired,
} from "../../domain/aggregated/entities/DataSynchronizationParams";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { EventsPackage } from "../../domain/events/entities/EventsPackage";
import { ProgramEvent } from "../../domain/events/entities/ProgramEvent";
import { EventsRepository } from "../../domain/events/repositories/EventsRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { cleanObjectDefault, cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { D2Api } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import mime from "mime-types";
import { D2TrackerEvent, TrackerEventsResponse } from "@eyeseetea/d2-api/api/trackerEvents";
import { TrackerPostParams, TrackerPostRequest, TrackerPostResponse } from "@eyeseetea/d2-api/api/tracker";

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
        const events = await this.getEventsByStrategy(params, programStageIds, defaults);

        // Temporal fix for notes:
        // If a note already exist and sync again the event the sync fail
        // Remove notes until the bug is fixed by dhis2
        const eventsWithoutNotes = events.map(event => ({ ...event, notes: [] }));

        return eventsWithoutNotes;
    }

    private async getEventsByStrategy(
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
            return this.api.tracker.events
                .get({
                    pageSize: 250,
                    totalPages: true,
                    page,
                    orgUnit,
                    occurredAfter: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                    occurredBefore: period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
                    updatedAfter: lastUpdated ? moment(lastUpdated).format("YYYY-MM-DD") : undefined,
                    fields: { $all: true },
                })
                .getData();
        };

        const result = await promiseMap(orgUnits, async (orgUnit): Promise<D2TrackerEvent[]> => {
            const firstResponse = await fetchApi(orgUnit, 1);

            const pageCount = Math.ceil((firstResponse.total || 0) / firstResponse.pageSize);

            const paginatedEvents = await promiseMap(_.range(2, pageCount + 1), async page => {
                const response = await fetchApi(orgUnit, page);

                return this.extractEvents(response);
            });

            const events = this.extractEvents(firstResponse);

            return [...events, ..._.flatten(paginatedEvents)];
        });

        return _(result)
            .flatten()
            .filter(({ programStage }) => (programStage ? programStageIds.includes(programStage) : false))
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
            return this.api.tracker.events
                .get({
                    pageSize: 250,
                    totalPages: true,
                    page,
                    programStage,
                    orgUnit,
                    occurredAfter: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                    occurredBefore:
                        period !== "ALL" && period !== "SINCE_LAST_SUCCESSFUL_SYNC"
                            ? endDate.format("YYYY-MM-DD")
                            : undefined,
                    updatedAfter: lastUpdated ? moment(lastUpdated).toISOString() : undefined,
                    fields: { $all: true },
                })
                .getData();
        };

        const result = await promiseMap(programStageIds, async programStage => {
            const filteredEvents = await promiseMap(orgUnits, async orgUnit => {
                const firstResponse = await fetchApi(programStage, orgUnit, 1);

                const pageCount = Math.ceil(firstResponse.total || 0 / firstResponse.pageSize);

                const paginatedEvents = await promiseMap(_.range(2, pageCount + 1), async page => {
                    const response = await fetchApi(programStage, orgUnit, page);

                    const events = this.extractEvents(response);

                    return events;
                });

                const events = this.extractEvents(firstResponse);

                return [...events, ..._.flatten(paginatedEvents)];
            });

            return _.flatten(filteredEvents);
        });

        return _(result)
            .flatten()
            .map(object => {
                const event = { ...object, id: object.event };

                return isDataSynchronizationRequired(params, object.updatedAt)
                    ? cleanObjectDefault(event, defaults)
                    : undefined;
            })
            .compact()
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
                const response = await this.api.tracker.events
                    .get({
                        programStage,
                        event: ids.join(";"),
                        fields: { $all: true },
                        skipPaging: true,
                    })
                    .getData();

                const events = this.extractEvents(response);

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
            if (data.events.length === 0) {
                return {
                    status: "SUCCESS",
                    stats: {
                        imported: 0,
                        updated: 0,
                        deleted: 0,
                        ignored: 0,
                        total: 0,
                    },
                    instance: this.instance.toPublicObject(),
                    date: new Date(),
                    type: "events",
                };
            } else {
                return this.push(params, data.events);
            }
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

    private cleanEventsImportResponse(importResult: TrackerPostResponse): SynchronizationResult {
        return {
            status: importResult.status === "OK" ? "SUCCESS" : importResult.status,
            stats: {
                imported: importResult.stats.created,
                updated: importResult.stats.updated,
                ignored: importResult.stats.ignored,
                deleted: importResult.stats.deleted,
                total: importResult.stats.total,
            },
            instance: this.instance.toPublicObject(),
            errors: importResult.validationReport.errorReports.map(error => {
                return {
                    id: error.uid,
                    message: error.message,
                    type: error.trackerType,
                };
            }),
            date: new Date(),
            type: "events",
            response: importResult,
        };
    }

    private async push(params: DataImportParams, events: ProgramEvent[]): Promise<SynchronizationResult> {
        const eventsPostParams: TrackerPostParams = {
            idScheme: params.idScheme ?? "UID",
            dataElementIdScheme: params.dataElementIdScheme ?? "UID",
            orgUnitIdScheme: params.orgUnitIdScheme ?? "UID",
            importMode: params.importMode ?? "COMMIT",
        };

        const trackerPostRequest: TrackerPostRequest = {
            events: events.map(event => ({ ...event, event: event.event || "" })),
        };

        if (params.async || params.async === undefined) {
            const { response } = await this.api.tracker.postAsync(eventsPostParams, trackerPostRequest).getData();

            const result = await this.api.system.waitFor("TRACKER_IMPORT_JOB", response.id).getData();

            if (!result) {
                return {
                    status: "ERROR",
                    instance: this.instance.toPublicObject(),
                    date: new Date(),
                    type: "events",
                };
            }

            return this.cleanEventsImportResponse(result);
        } else {
            const result = await this.api.tracker.post(eventsPostParams, trackerPostRequest).getData();

            return this.cleanEventsImportResponse(result);
        }
    }

    async getEventFile(eventUid: string, dataElementUid: string, fileResourceId: string): Promise<File> {
        const blob = await this.api
            .request<Blob>({
                method: "get",
                url: `/events/files`,
                responseDataType: "raw",
                params: {
                    eventUid,
                    dataElementUid,
                },
            })
            .getData();

        if (!blob) throw Error("An error has ocurred retrieving the file resource of data value");

        const fileResource = await this.api
            .get<{ name: string; contentType: string }>(`/fileResources/${fileResourceId}`)
            .getData();

        const fileName = fileResource?.name || `File.${mime.extension(fileResource.contentType)}`;

        return new File([blob], fileName, { type: fileResource.contentType });
    }

    extractEvents(response: TrackerEventsResponse): D2TrackerEvent[] {
        return response.instances || (hasEventsProperty(response) ? response.events : []);
    }
}

function hasEventsProperty(obj: any): obj is { events: D2TrackerEvent[] } {
    return obj && Array.isArray(obj.events);
}
