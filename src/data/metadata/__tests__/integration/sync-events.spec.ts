import { Request, Server } from "miragejs";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { DynamicRepositoryFactory } from "../../../../domain/common/factories/DynamicRepositoryFactory";
import { EventsSyncUseCase } from "../../../../domain/events/usecases/EventsSyncUseCase";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { SynchronizationBuilder } from "../../../../domain/synchronization/entities/SynchronizationBuilder";
import { startDhis } from "../../../../utils/dhisServer";
import { registerDynamicRepositoriesInFactory } from "../../../../presentation/CompositionRoot";
import { EventsPayloadBuilder } from "../../../../domain/events/builders/EventsPayloadBuilder";
import { AggregatedPayloadBuilder } from "../../../../domain/aggregated/builders/AggregatedPayloadBuilder";

const repositoryFactory = buildRepositoryFactory();

describe("Sync events", () => {
    let local: Server;
    let remote: Server;

    beforeAll(() => {
        jest.setTimeout(30000);
    });

    beforeEach(() => {
        local = startDhis({ urlPrefix: "http://origin.test" });
        remote = startDhis({
            urlPrefix: "http://destination.test",
            pretender: local.pretender,
        });

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

        remote.get("/categoryOptionCombos", async () => ({
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
        remote.get("/dataValueSets", async () => ({ dataValues: [] }));

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

        remote.get("/tracker/events", async () => ({
            page: 1,
            pageCount: 1,
            pageSize: 1,
            total: 1,
            instances: [
                {
                    storedBy: "widp.admin",
                    scheduledAt: "2020-04-11T00:00:02.846",
                    program: "program1",
                    event: "test-event-2",
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

        remote.get("/metadata", async () => ({
            categoryOptions: [{ id: "default5" }],
            categories: [{ id: "default6" }],
            categoryCombos: [{ id: "default7" }],
            categoryOptionCombos: [{ id: "default8" }],
            dataElements: [{ id: "id2", name: "Test data element 2" }],
        }));

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

        // local.get("/trackedEntityInstances", async () => ({
        //     trackedEntityInstances: [],
        // }));

        const addEventsToDb = async (schema: Schema<AnyRegistry>, request: Request) => {
            const body = JSON.parse(request.requestBody);
            schema.db.events.insert(body);

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
                        EVENT: {
                            trackerType: "EVENT",
                            stats: {
                                created: 1,
                                updated: 0,
                                deleted: 0,
                                ignored: 0,
                                total: 1,
                            },
                            objectReports: [
                                {
                                    trackerType: "EVENT",
                                    uid: body.events[0].event,
                                    errorReports: [],
                                },
                            ],
                        },
                    },
                },
            };
        };

        local.db.createCollection("events", []);
        local.post("/tracker", addEventsToDb);

        remote.db.createCollection("events", []);
        remote.post("/tracker", addEventsToDb);
    });

    afterEach(() => {
        local.shutdown();
        remote.shutdown();
    });

    it("Local server to remote - same version", async () => {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.36",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["program1"],
            excludedIds: [],
            dataParams: {
                allEvents: true,
                orgUnitPaths: ["/Global"],
            },
        };

        const eventsPayloadBuilder = new EventsPayloadBuilder(repositoryFactory, localInstance);
        const aggregatedPayloadBuilder = new AggregatedPayloadBuilder(repositoryFactory, localInstance);

        const sync = new EventsSyncUseCase(
            builder,
            repositoryFactory,
            localInstance,
            eventsPayloadBuilder,
            aggregatedPayloadBuilder
        );

        const payload = await eventsPayloadBuilder.build(builder);

        expect(payload.events?.find(({ id }) => id === "test-event-1")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = remote.db.events.find(1);
        expect(response.events[0].id).toEqual("test-event-1");
        expect(local.db.events.find(1)).toBeNull();
    });

    it("Remote server to local - same version", async () => {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.36",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "DESTINATION",
            targetInstances: ["LOCAL"],
            metadataIds: ["program1"],
            excludedIds: [],
            dataParams: {
                allEvents: true,
                orgUnitPaths: ["/Global"],
            },
        };
        const eventsPayloadBuilder = new EventsPayloadBuilder(repositoryFactory, localInstance);
        const aggregatedPayloadBuilder = new AggregatedPayloadBuilder(repositoryFactory, localInstance);

        const sync = new EventsSyncUseCase(
            builder,
            repositoryFactory,
            localInstance,
            eventsPayloadBuilder,
            aggregatedPayloadBuilder
        );

        const payload = await eventsPayloadBuilder.build(builder);

        expect(payload.events?.find(({ id }) => id === "test-event-2")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = local.db.events.find(1);
        expect(response.events[0].id).toEqual("test-event-2");
        expect(remote.db.events.find(1)).toBeNull();
    });
});

function buildRepositoryFactory() {
    const repositoryFactory: DynamicRepositoryFactory = new DynamicRepositoryFactory();

    registerDynamicRepositoriesInFactory(repositoryFactory);

    return repositoryFactory;
}

export {};
