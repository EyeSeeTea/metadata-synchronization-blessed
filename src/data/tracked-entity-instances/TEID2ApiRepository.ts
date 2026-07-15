import {
    D2TrackerTrackedEntity,
    D2TrackerTrackedEntitySchema,
    TrackedEntitiesGetResponse,
    TrackerPostParams,
    TrackerPostRequest,
    TrackerPostResponse,
} from "../../types/d2-api";
import _ from "lodash";
import {
    DataImportParams,
    DataSynchronizationParams,
    isDataSynchronizationRequired,
} from "../../domain/aggregated/entities/DataSynchronizationParams";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { Instance } from "../../domain/instance/entities/Instance";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { TEIsPackage } from "../../domain/tracked-entity-instances/entities/TEIsPackage";
import { TrackedEntityInstance } from "../../domain/tracked-entity-instances/entities/TrackedEntityInstance";
import { TEIRepository, TEIsResponse } from "../../domain/tracked-entity-instances/repositories/TEIRepository";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";
import { D2Api, SelectedPick } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { getPageCount, getRemainingPages } from "../../utils/pagination";
import { teiTransformations } from "../transformations/PackageTransformations";

export class TEID2ApiRepository implements TEIRepository {
    private api: D2Api;

    constructor(
        localInstance: Instance,
        private targetInstance: Instance,
        private transformationRepository: TransformationRepository
    ) {
        this.api = getD2APiFromInstance(localInstance, targetInstance);
    }

    async getAllTEIs(params: DataSynchronizationParams, programs: string[]): Promise<TrackedEntityInstance[]> {
        const result = await promiseMap(programs, async program => {
            const { instances, ...pager } = await this.getTEIs(params, program, 1, 250);

            const remainingPages = getRemainingPages(pager);

            const paginatedTEIs = await promiseMap(remainingPages, async page => {
                const { instances } = await this.getTEIs(params, program, page, 250);
                return instances;
            });

            return [...instances, ..._.flatten(paginatedTEIs)];
        });

        const systemInfo = await this.api.system.info.getData();
        const serverTimeZoneId = systemInfo.serverTimeZoneId;
        return _(result)
            .flatten()
            .filter(object => isDataSynchronizationRequired(params, object.updatedAt, serverTimeZoneId))
            .value();
    }

    async getTEIs(
        params: DataSynchronizationParams,
        program: string,
        page: number,
        pageSize: number
    ): Promise<TEIsResponse> {
        const { period, orgUnitPaths = [], teisSyncPeriodField } = params;
        const { startDate, endDate } = buildPeriodFromParams(params);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0)
            return {
                instances: [],
                pageCount: 1,
                pageSize,
                total: 0,
                page,
            };

        const periodFilter =
            teisSyncPeriodField === "LAST_UPDATED"
                ? {
                      updatedAfter: startDate.format("YYYY-MM-DD"),
                      updatedBefore: endDate.format("YYYY-MM-DD"),
                  }
                : {
                      enrollmentEnrolledAfter: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                      enrollmentEnrolledBefore:
                          period !== "ALL" && period !== "SINCE_LAST_SUCCESSFUL_SYNC"
                              ? endDate.format("YYYY-MM-DD")
                              : undefined,
                  };

        const result = await this.api.tracker.trackedEntities
            .get({
                fields: teiFields,
                program,
                ouMode: "SELECTED",
                orgUnit: orgUnits.join(";"),
                totalPages: true,
                page,
                pageSize,
                ...periodFilter,
            })
            .getData();

        const trackedEntities = result.instances || (hasTrackedEntitiesProperty(result) ? result.trackedEntities : []);

        return {
            instances: trackedEntities.map(tei => this.buildTrackedEntityInstance(tei)),
            page,
            pageSize,
            total: result.total || 0,
            pageCount: getPageCount(result),
        };
    }

    async getTEIsById(params: DataSynchronizationParams, ids: string[]): Promise<TrackedEntityInstance[]> {
        const { orgUnitPaths = [] } = params;
        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return [];
        if (ids.length === 0) return [];

        // Cross-program lookup by TEI ids: the DHIS2 /tracker/trackedEntities endpoint
        // accepts omitting `program`, but d2-api types mark it as required. Cast to bypass.
        const result: TrackedEntitiesGetResponse<any> = await this.api.tracker.trackedEntities
            .get({
                fields: teiFields,
                ouMode: "SELECTED",
                orgUnit: orgUnits.join(";"),
                trackedEntity: ids.join(";"),
            } as Parameters<typeof this.api.tracker.trackedEntities.get>[0])
            .getData();

        const trackedEntities = result.instances || (hasTrackedEntitiesProperty(result) ? result.trackedEntities : []);

        return trackedEntities.map(tei => this.buildTrackedEntityInstance(tei));
    }

    async save(data: TEIsPackage, additionalParams: DataImportParams | undefined): Promise<SynchronizationResult> {
        try {
            const teiPostParams = this.getTeiPostParams(additionalParams);

            const baseRequest: TrackerPostRequest = {
                trackedEntities: data.trackedEntities.map(tei => this.buildD2TrackerTrackedEntity(tei)),
            };

            const versionedRequest = this.transformationRepository.mapPackageTo<TrackerPostRequest, TrackerPostRequest>(
                this.targetInstance.apiVersion,
                baseRequest,
                teiTransformations
            );

            const response = await this.api.tracker.post(teiPostParams, versionedRequest).getData();

            return this.cleanTEIsImportResponse(response);
        } catch (error: any) {
            if (error?.response?.data) {
                return this.cleanTEIsImportResponse(error.response.data);
            }

            return {
                status: "NETWORK ERROR",
                instance: this.targetInstance.toPublicObject(),
                date: new Date(),
                type: "events",
            };
        }
    }

    private getTeiPostParams(params: DataImportParams | undefined): TrackerPostParams {
        const defaultTeiPostParams: TrackerPostParams = {
            idScheme: "UID",
            dataElementIdScheme: "UID",
            orgUnitIdScheme: "UID",
            importMode: "COMMIT",
            importStrategy: "CREATE_AND_UPDATE",
        };

        if (!params) return defaultTeiPostParams;

        const teiPostParams: TrackerPostParams = {
            idScheme: params?.idScheme ?? defaultTeiPostParams.idScheme,
            dataElementIdScheme: params?.dataElementIdScheme ?? defaultTeiPostParams.dataElementIdScheme,
            orgUnitIdScheme: params?.orgUnitIdScheme ?? defaultTeiPostParams.orgUnitIdScheme,
            importMode: params?.importMode ?? defaultTeiPostParams.importMode,
            importStrategy: this.convertImportStrategy(params?.strategy) ?? defaultTeiPostParams.importStrategy,
            skipRuleEngine: params?.skipRuleEngine,
        };

        return params?.async !== undefined ? { ...teiPostParams, async: params.async } : teiPostParams;
    }

    private convertImportStrategy(
        strategy: DataImportParams["strategy"]
    ): TrackerPostParams["importStrategy"] | undefined {
        switch (strategy) {
            case "NEW_AND_UPDATES":
                return "CREATE_AND_UPDATE";
            case "NEW":
                return "CREATE";
            case "UPDATES":
                return "UPDATE";
            case "DELETES":
                return "DELETE";
            default:
                return undefined;
        }
    }

    private cleanTEIsImportResponse(importResult: TrackerPostResponse): SynchronizationResult {
        const stats = importResult.bundleReport
            ? importResult.bundleReport.typeReportMap.TRACKED_ENTITY.stats
            : importResult.stats;
        return {
            status: importResult.status === "OK" ? "SUCCESS" : importResult.status,
            stats: {
                imported: stats?.created ?? 0,
                updated: stats?.updated ?? 0,
                ignored: stats?.ignored ?? 0,
                deleted: stats?.deleted ?? 0,
                total: stats?.total ?? 0,
            },
            instance: this.targetInstance.toPublicObject(),
            errors: importResult.validationReport.errorReports.map(error => {
                return {
                    id: error.uid,
                    message: error.message,
                    type: error.trackerType,
                };
            }),
            date: new Date(),
            type: "trackedEntityInstances",
            response: importResult,
        };
    }

    private buildTrackedEntityInstance(tei: D2TrackerEntitySelectedPick): TrackedEntityInstance {
        const enrollments: TrackedEntityInstance["enrollments"] =
            tei.enrollments?.map(
                (
                    enrollment: NonNullable<D2TrackerEntitySelectedPick["enrollments"]>[number]
                ): TrackedEntityInstance["enrollments"][number] => ({
                    ...enrollment,
                    orgUnit: enrollment.orgUnit || "",
                    notes: (enrollment.notes ?? []).map(note => (typeof note === "string" ? note : note.value)),
                    attributes: enrollment.attributes?.map(attribute => ({
                        ...attribute,
                        value: attribute.value?.toString() || "",
                    })),
                })
            ) || [];

        return {
            ...tei,
            trackedEntity: tei.trackedEntity || "",
            orgUnit: tei.orgUnit || "",
            programOwners: tei.programOwners || [],
            enrollments,
            relationships: tei.relationships || [],
            attributes:
                tei.attributes?.map(attribute => {
                    return {
                        ...attribute,
                        displayName: attribute.displayName || "",
                    };
                }) || [],
        };
    }

    private buildD2TrackerTrackedEntity(tei: TrackedEntityInstance): D2TrackerTrackedEntity {
        return {
            ...tei,
            geometry: (tei as any).geometry ?? { type: "Point" as const, coordinates: [0, 0] },
            trackedEntityType: tei.trackedEntityType || "",
            createdAt: tei.createdAt || "",
            createdAtClient: tei.createdAtClient || "",
            updatedAt: tei.updatedAt || "",
            updatedAtClient: tei.updatedAtClient || "",
            inactive: tei.inactive || false,
            deleted: tei.deleted || false,
            attributes:
                tei.attributes.map(attribute => ({
                    ...attribute,
                    createdAt: attribute.createdAt || "",
                    updatedAt: attribute.updatedAt || "",
                    storedBy: attribute.storedBy || "",
                    valueType: attribute.valueType || "",
                })) || [],
            enrollments: tei.enrollments.map(enrollment => {
                return {
                    ...enrollment,
                    events: [],
                    relationships: [],
                    notes: (enrollment.notes ?? []).map(value =>
                        typeof value === "string" ? { note: "", storedAt: "", storedBy: "", value } : value
                    ),
                };
            }),
        } as unknown as D2TrackerTrackedEntity;
    }
}

function hasTrackedEntitiesProperty(obj: any): obj is { trackedEntities: D2TrackerEntitySelectedPick[] } {
    return obj && Array.isArray(obj.trackedEntities);
}

const enrollmentsFields = {
    enrollment: true,
    createdAt: true,
    createdAtClient: true,
    updatedAt: true,
    updatedAtClient: true,
    trackedEntity: true,
    program: true,
    status: true,
    orgUnit: true,
    orgUnitName: true,
    enrolledAt: true,
    occurredAt: true,
    followUp: true,
    deleted: true,
    storedBy: true,
    notes: true,
    attributes: true,
} as const;

const teiFields = {
    trackedEntity: true,
    createdAt: true,
    orgUnit: true,
    createdAtClient: true,
    updatedAt: true,
    trackedEntityType: true,
    updatedAtClient: true,
    inactive: true,
    deleted: true,
    programOwners: true,
    enrollments: enrollmentsFields,
    relationships: true,
    attributes: true,
    geometry: true,
} as const;

export type D2TrackerEntitySelectedPick = SelectedPick<D2TrackerTrackedEntitySchema, typeof teiFields>;
