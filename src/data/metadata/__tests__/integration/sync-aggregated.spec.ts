import { Request, Server } from "miragejs";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { AggregatedPayloadBuilder } from "../../../../domain/aggregated/builders/AggregatedPayloadBuilder";
import { AggregatedSyncUseCase } from "../../../../domain/aggregated/usecases/AggregatedSyncUseCase";
import { DynamicRepositoryFactory } from "../../../../domain/common/factories/DynamicRepositoryFactory";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { SynchronizationBuilder } from "../../../../domain/synchronization/entities/SynchronizationBuilder";
import { registerDynamicRepositoriesInFactory } from "../../../../presentation/CompositionRoot";
import { startDhis } from "../../../../utils/dhisServer";

const repositoryFactory = buildRepositoryFactory();

describe("Sync aggregated", () => {
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
            if (request.queryParams.filter === "id:in:[dataSet1]") {
                return {
                    dataSets: [
                        {
                            name: "Test data set",
                            id: "dataSet1",
                            dataSetElements: [
                                {
                                    dataElement: {
                                        name: "Test data element 1",
                                        id: "id1",
                                    },
                                    dataSet: {
                                        id: "dataSet1",
                                    },
                                },
                            ],
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
            } else if (request.queryParams.filter === "id:in:[id1]" && request.queryParams.fields === "id,valueType") {
                return {
                    dataElements: [
                        {
                            id: "id1",
                            valueType: "TEXT",
                        },
                    ],
                };
            } else {
                console.error("Unknown metadata request", request.queryParams);
            }
        });

        local.get("/dataValueSets", async () => ({
            dataValues: [
                {
                    dataElement: "id1",
                    period: "20191231",
                    orgUnit: "Global",
                    categoryOptionCombo: "default4",
                    attributeOptionCombo: "default4",
                    value: "test-value-1",
                    storedBy: "test-user",
                    created: "2020-05-28T08:32:53.000+0000",
                    lastUpdated: "2020-05-28T08:32:53.000+0000",
                    followup: false,
                },
            ],
        }));

        remote.get("/dataValueSets", async () => ({
            dataValues: [
                {
                    dataElement: "id2",
                    period: "20191231",
                    orgUnit: "Global",
                    categoryOptionCombo: "default4",
                    attributeOptionCombo: "default4",
                    value: "test-value-2",
                    storedBy: "test-user",
                    created: "2020-05-28T08:32:53.000+0000",
                    lastUpdated: "2020-05-28T08:32:53.000+0000",
                    followup: false,
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
        local.get("/dataStore/metadata-synchronization/mappings", async () => [
            {
                id: "MAPPINGDESTINATION",
                owner: {
                    id: "DESTINATION",
                    type: "instance",
                },
            },
        ]);
        local.get("/dataStore/metadata-synchronization/mappings-MAPPINGDESTINATION", async () => ({
            mappingDictionary: {
                aggregatedDataElements: {
                    id1: {
                        mappedId: "id2",
                        mappedName: "foo",
                        code: "foo",
                        conflicts: false,
                        global: false,
                        mapping: {},
                    },
                },
            },
        }));

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

        const addAggregatedToDb = async (schema: Schema<AnyRegistry>, request: Request) => {
            schema.db.dataValueSets.insert(JSON.parse(request.requestBody));

            return {
                responseType: "ImportSummary",
                status: "WARNING",
                description: "Import process completed successfully",
                importCount: { imported: 0, updated: 0, ignored: 477, deleted: 0 },
                conflicts: [
                    {
                        object: "id1",
                        value: "Data element not found or not accessible",
                    },
                ],
                dataSetComplete: "false",
            };
        };

        local.db.createCollection("dataValueSets", []);
        local.post("/dataValueSets", addAggregatedToDb);

        remote.db.createCollection("dataValueSets", []);
        remote.post("/dataValueSets", addAggregatedToDb);
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
            metadataIds: ["dataSet1"],
            excludedIds: [],
            dataParams: { orgUnitPaths: ["/Global"] },
        };

        const aggregatedPayloadBuilder = new AggregatedPayloadBuilder(repositoryFactory, localInstance);

        const sync = new AggregatedSyncUseCase(builder, repositoryFactory, localInstance, aggregatedPayloadBuilder);

        const payload = await aggregatedPayloadBuilder.build(builder);

        expect(payload.dataValues?.find(({ value }) => value === "test-value-1")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = remote.db.dataValueSets.find(1);
        expect(response.dataValues[0].value).toEqual("test-value-1");
        expect(response.dataValues[0].dataElement).toEqual("id2");
        expect(local.db.dataValueSets.find(1)).toBeNull();
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
            metadataIds: ["dataSet1"],
            excludedIds: [],
            dataParams: { orgUnitPaths: ["/Global"] },
        };

        const aggregatedPayloadBuilder = new AggregatedPayloadBuilder(repositoryFactory, localInstance);

        const sync = new AggregatedSyncUseCase(builder, repositoryFactory, localInstance, aggregatedPayloadBuilder);

        const payload = await aggregatedPayloadBuilder.build(builder);

        expect(payload.dataValues?.find(({ value }) => value === "test-value-2")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = local.db.dataValueSets.find(1);
        expect(response.dataValues[0].value).toEqual("test-value-2");
        expect(response.dataValues[0].dataElement).toEqual("id1");
        expect(remote.db.dataValueSets.find(1)).toBeNull();
    });
});

function buildRepositoryFactory() {
    const repositoryFactory: DynamicRepositoryFactory = new DynamicRepositoryFactory();

    registerDynamicRepositoriesInFactory(repositoryFactory);

    return repositoryFactory;
}

export {};
