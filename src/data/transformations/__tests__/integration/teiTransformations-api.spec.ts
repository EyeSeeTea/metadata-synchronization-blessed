import { Request, Server } from "miragejs";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { EventsSyncUseCase } from "../../../../domain/events/usecases/EventsSyncUseCase";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { SynchronizationBuilder } from "../../../../domain/synchronization/entities/SynchronizationBuilder";
import { startDhis } from "../../../../utils/dhisServer";
import { EventsPayloadBuilder } from "../../../../domain/events/builders/EventsPayloadBuilder";
import { AggregatedPayloadBuilder } from "../../../../domain/aggregated/builders/AggregatedPayloadBuilder";
import { DynamicRepositoryFactory } from "../../../../domain/common/factories/DynamicRepositoryFactory";
import { registerDynamicRepositoriesInFactory } from "../../../../presentation/CompositionRoot";
import { AggregatedDataExchangeApiExecutor } from "../../../aggregated/AggregatedDataExchangeApiExecutor";

const localInstance = Instance.build({
    url: "http://origin.test",
    name: "Testing",
    version: "2.36",
    type: "local",
});

const mockAttributes = [
    {
        attribute: "attribute1",
        code: "ATTR_CODE",
        displayName: "AttributeCode",
        createdAt: "2025-09-03T09:47:21.802",
        updatedAt: "2025-09-03T09:47:21.803",
        storedBy: "user.test1",
        valueType: "INTEGER_ZERO_OR_POSITIVE",
        value: "0",
    },
];

function setupMockEndpoints(local: Server, destinationVersion = "2.36") {
    local.get("/categoryOptionCombos", async () => ({
        categoryOptionCombos: [
            {
                name: "default",
                id: "default8",
                categoryCombo: { id: "default7" },
                categoryOptions: [{ id: "default5" }],
            },
        ],
    }));

    local.get("/routes/DESTINATION/run/api/categoryOptionCombos", async () => ({
        categoryOptionCombos: [
            {
                name: "default",
                id: "default4",
                categoryCombo: { id: "default3" },
                categoryOptions: [{ id: "default1" }],
            },
        ],
    }));

    local.get("/metadata", async (_schema, request) => {
        if (request.queryParams.filter === "id:in:[program1]") {
            return {
                programs: [
                    {
                        name: "Test program",
                        id: "program1",
                        programStages: [
                            {
                                programStageDataElements: [
                                    {
                                        dataElement: {
                                            name: "Test data element",
                                            id: "id1",
                                            displayFormName: "Test data element",
                                        },
                                    },
                                ],
                            },
                        ],
                        programIndicators: [],
                        programType: "WITH_REGISTRATION",
                    },
                ],
            };
        } else if (request.queryParams.filter === "identifiable:eq:default") {
            return {
                categoryOptions: [{ id: "default1" }],
                categories: [{ id: "default2" }],
                categoryCombos: [{ id: "default3" }],
                categoryOptionCombos: [{ id: "default4" }],
            };
        } else if (request.queryParams.filter === "id:in:[id1]") {
            return {
                dataElements: [{ id: "id1", valueType: "TEXT" }],
            };
        } else {
            console.error("Unknown metadata request", request.queryParams);
        }
    });

    local.get("/dataValueSets", async () => ({ dataValues: [] }));
    local.get("/routes/DESTINATION/run/api/dataValueSets", async () => ({ dataValues: [] }));

    local.get("/tracker/events", async () => ({
        page: 1,
        pageCount: 1,
        pageSize: 1,
        total: 1,
        instances: [
            {
                storedBy: "widp.admin",
                scheduledAt: "2020-04-11T00:00:02.846",
                program: "program1",
                event: "test-event-1",
                programStage: "EGA9fqLFtxM",
                orgUnit: "Global",
                status: "ACTIVE",
                orgUnitName: "Global",
                occurredAt: "2020-04-11T00:00:00.000",
                attributeCategoryOptions: "Y7fcspgsU43",
                updatedAt: "2020-06-09T07:06:35.514",
                createdAt: "2020-06-09T07:06:35.513",
                deleted: false,
                attributeOptionCombo: "Xr12mI7VPn3",
                dataValues: [
                    {
                        updatedAt: "2020-06-09T07:06:35.515",
                        storedBy: "widp.admin",
                        createdAt: "2020-06-09T07:06:35.515",
                        dataElement: "id1",
                        value: "true",
                        providedElsewhere: false,
                    },
                ],
                notes: [],
            },
        ],
    }));

    local.get("/routes/DESTINATION/run/api/tracker/events", async () => ({
        page: 1,
        pageCount: 1,
        pageSize: 1,
        total: 1,
        instances: [],
    }));

    local.get("/routes/DESTINATION/run/api/metadata", async (_schema, request) => {
        if (request.queryParams.filter === "id:in:[program1]") {
            return {
                programs: [
                    {
                        name: "Test program",
                        id: "program1",
                        programStages: [
                            {
                                programStageDataElements: [
                                    {
                                        dataElement: {
                                            name: "Test data element",
                                            id: "id1",
                                            displayFormName: "Test data element",
                                        },
                                    },
                                ],
                            },
                        ],
                        programIndicators: [],
                        programType: "WITH_REGISTRATION",
                        programTrackedEntityAttributes: [
                            {
                                trackedEntityAttribute: {
                                    id: "attribute1",
                                },
                            },
                        ],
                    },
                ],
            };
        } else {
            return {
                categoryOptions: [{ id: "default5" }],
                categories: [{ id: "default6" }],
                categoryCombos: [{ id: "default7" }],
                categoryOptionCombos: [{ id: "default8" }],
                dataElements: [{ id: "id2", name: "Test data element 2" }],
            };
        }
    });

    local.get("/dataStore/metadata-synchronization/instances", async () => [
        {
            type: "local",
            id: "LOCAL",
            name: "This instance",
            description: "",
            url: "http://origin.test",
        },
        {
            type: "dhis",
            id: "DESTINATION",
            name: "Destination test",
            url: "http://destination.test",
            username: "test",
            password: "",
            description: "",
        },
    ]);

    local.get("/dataStore/metadata-synchronization/instances-LOCAL", async () => ({}));
    local.get("/dataStore/metadata-synchronization/instances-DESTINATION", async () => ({}));
    local.get("/dataStore/metadata-synchronization/mappings", async () => []);

    local.get("/dataStore/metadata-synchronization/instances-LOCAL/metaData", async () => ({
        created: "2021-03-30T01:59:59.191",
        lastUpdated: "2021-04-20T09:34:00.780",
        externalAccess: false,
        publicAccess: "rw------",
        user: { id: "H4atNsEuKxP" },
        userGroupAccesses: [],
        userAccesses: [],
        lastUpdatedBy: { id: "s5EVHUwoFKu" },
        namespace: "metadata-synchronization",
        key: "instances-LOCAL",
        value: "",
        favorite: false,
        id: "Db5532sXKXT",
    }));

    local.get("/dataStore/metadata-synchronization/instances-DESTINATION/metaData", async () => ({
        created: "2021-03-30T01:59:59.191",
        lastUpdated: "2021-04-20T09:34:00.780",
        externalAccess: false,
        publicAccess: "rw------",
        user: { id: "H4atNsEuKxP" },
        userGroupAccesses: [],
        userAccesses: [],
        lastUpdatedBy: { id: "s5EVHUwoFKu" },
        namespace: "metadata-synchronization",
        key: "instances-DESTINATION",
        value: "",
        favorite: false,
        id: "Db5532sXKX1",
    }));

    local.get("/sharing", async () => ({
        meta: {
            allowPublicAccess: true,
            allowExternalAccess: false,
        },
        object: {
            id: "Db5532sXKXT",
            publicAccess: "rw------",
            user: { id: "H4atNsEuKxP" },
            userGroupAccesses: [],
            userAccesses: [],
            externalAccess: false,
        },
    }));

    local.get("/sharing", async () => ({
        meta: {
            allowPublicAccess: true,
            allowExternalAccess: false,
        },
        object: {
            id: "Db5532sXKX1",
            externalAccess: false,
            publicAccess: "rw------",
            user: { id: "H4atNsEuKxP" },
            userGroupAccesses: [],
            userAccesses: [],
        },
    }));

    local.get("/tracker/trackedEntities", async () => ({
        page: 1,
        total: 1,
        pageCount: 1,
        pageSize: 250,
        instances: [
            {
                trackedEntity: "trackedEntity1",
                trackedEntityType: "aAaAg9MA9Pl",
                createdAt: "2025-09-03T09:47:21.794",
                createdAtClient: "2025-09-03T09:47:21.794",
                updatedAt: "2025-09-03T12:37:17.877",
                updatedAtClient: "2025-09-03T09:47:21.794",
                orgUnit: "Global",
                relationships: [],
                attributes: mockAttributes,
                enrollments: [
                    {
                        enrollment: "enrollment1",
                        createdAt: "2025-09-03T09:47:21.932",
                        createdAtClient: "2025-09-03T09:47:21.938",
                        updatedAt: "2025-09-03T09:47:21.938",
                        updatedAtClient: "2025-09-03T09:47:21.938",
                        trackedEntity: "trackedEntity1",
                        program: "program1",
                        status: "ACTIVE",
                        orgUnit: "Global",
                        orgUnitName: "20250612 - Test EFH",
                        enrolledAt: "2025-09-03T00:00:00.000",
                        occurredAt: "2025-09-03T00:00:00.000",
                        followUp: false,
                        deleted: false,
                        storedBy: "user.test1",
                        attributes: mockAttributes,
                        notes: [],
                    },
                ],
                programOwners: [
                    {
                        orgUnit: "Global",
                        trackedEntity: "trackedEntity1",
                        program: "program1",
                    },
                ],
            },
        ],
    }));

    local.get("/dataStore/metadata-synchronization/instances", async () => [
        {
            id: "DESTINATION",
        },
    ]);

    local.get("/routes", async () => ({
        routes: [
            {
                id: "DESTINATION",
                name: "Destination test",
                url: "http://destination.test",
                username: "test",
                auth: { type: "http-basic", username: "test", password: "" },
                description: "",
                sharing: {
                    external: false,
                    owner: "H4atNsEuKxP",
                    public: "rw------",
                    users: {},
                    userGroups: {},
                },
            },
        ],
    }));

    local.get("/routes/DESTINATION/run/api/system/info", () => ({ version: destinationVersion }));
}

function setupTrackerEndpoints(local: Server) {
    const addEventsPayloadToDb = async (schema: Schema<AnyRegistry>, request: Request, collection: string) => {
        const body = JSON.parse(request.requestBody);
        schema.db[collection].insert(body);
        const { events, trackedEntities } = body;
        const report = (type: "EVENT" | "TRACKED_ENTITY", entities?: object[]) =>
            entities
                ? {
                      [type]: {
                          trackerType: type,
                          stats: {
                              created: entities.length,
                              updated: 0,
                              deleted: 0,
                              ignored: 0,
                              total: entities.length,
                          },
                          objectReports: entities.map(e => ({
                              trackerType: type,
                              uid:
                                  type === "EVENT"
                                      ? (e as any).event
                                      : type === "TRACKED_ENTITY"
                                      ? (e as any).trackedEntity
                                      : "unknown",
                              errorReports: [],
                          })),
                      },
                  }
                : null;
        return {
            status: "OK",
            validationReport: {
                errorReports: [],
                warningReports: [],
            },
            stats: {
                created: 1,
                updated: 0,
                deleted: 0,
                ignored: 0,
                total: 1,
            },
            bundleReport: {
                typeReportMap: {
                    ...report("EVENT", events),
                    ...report("TRACKED_ENTITY", trackedEntities),
                },
            },
        };
    };

    local.db.createCollection("eventsLocal", []);
    local.post("/tracker", (schema, request) => addEventsPayloadToDb(schema, request, "eventsLocal"));

    local.db.createCollection("eventsDestination", []);
    local.post("/routes/DESTINATION/run/api/tracker", (schema, request) =>
        addEventsPayloadToDb(schema, request, "eventsDestination")
    );
}

async function runSyncEventsTest({ from, to }: { from: string; to: string }) {
    const local = startDhis({ urlPrefix: "http://origin.test" }, { version: from });

    setupMockEndpoints(local, to);
    setupTrackerEndpoints(local);
    const repositoryFactory = buildRepositoryFactory(localInstance);

    const builder: SynchronizationBuilder = {
        originInstance: "LOCAL",
        targetInstances: ["DESTINATION"],
        metadataIds: ["program1"],
        excludedIds: [],
        dataParams: {
            allEvents: true,
            allTEIs: true,
            orgUnitPaths: ["/Global"],
        },
    };

    const eventsPayloadBuilder = new EventsPayloadBuilder(repositoryFactory, localInstance);
    const aggregatedDataExchangeExecutor = new AggregatedDataExchangeApiExecutor(localInstance);

    const aggregatedPayloadBuilder = new AggregatedPayloadBuilder(repositoryFactory, localInstance);
    const sync = new EventsSyncUseCase(
        builder,
        repositoryFactory,
        localInstance,
        eventsPayloadBuilder,
        aggregatedPayloadBuilder,
        aggregatedDataExchangeExecutor
    );

    for await (const _sync of sync.execute()) {
        // no-op
    }

    const response = local.db.eventsDestination.find(1);

    local.shutdown();

    return response;
}

describe("TEI Transformations Integration tests", () => {
    it("local v40 to remote v40: should include tei.enrollment.attributes", async () => {
        const response = await runSyncEventsTest({ from: "2.40", to: "2.40" });

        expect(response).toHaveProperty("trackedEntities");
        expect(response.trackedEntities[0].trackedEntity).toEqual("trackedEntity1");
        expect(response.trackedEntities[0].enrollments[0].attributes).toEqual(mockAttributes);
    });

    it("local v40 to remote v41: should not include tei.enrollment.attributes", async () => {
        const response = await runSyncEventsTest({ from: "2.40", to: "2.41" });

        expect(response).toHaveProperty("trackedEntities");
        expect(response.trackedEntities[0].trackedEntity).toEqual("trackedEntity1");
        expect(response.trackedEntities[0].enrollments[0].attributes).toHaveLength(0);
    });
});

function buildRepositoryFactory(localInstance: Instance) {
    const repositoryFactory: DynamicRepositoryFactory = new DynamicRepositoryFactory();

    registerDynamicRepositoriesInFactory(localInstance, repositoryFactory);

    return repositoryFactory;
}
