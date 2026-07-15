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
import { AggregatedDataExchangeApiExecutor } from "../../../aggregated/AggregatedDataExchangeApiExecutor";

const localInstance = Instance.build({
    url: "http://origin.test",
    name: "Testing",
    version: "2.36",
    type: "local",
});

const repositoryFactory = buildRepositoryFactory(localInstance);

describe("Sync local instance mapped", () => {
    let local: Server;

    beforeEach(() => {
        local = startDhis({ urlPrefix: "http://origin.test" });

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

        local.get("/dataStore/metadata-synchronization/instances", async () => []);

        // Local is created by repostitory in memmory
        local.get("/routes", async () => ({ routes: [] }));

        local.get("/dataStore/metadata-synchronization/instances-LOCAL", async () => ({}));
        local.get("/dataStore/metadata-synchronization/mappings", async () => [
            {
                id: "MAPPINGLOCAL",
                owner: {
                    id: "LOCAL",
                    type: "instance",
                },
            },
        ]);
        local.get("/dataStore/metadata-synchronization/mappings-MAPPINGLOCAL", async () => ({
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
    });

    afterEach(() => {
        local.shutdown();
    });

    it("Local server to local - same version", async () => {
        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["LOCAL"],
            metadataIds: ["dataSet1"],
            excludedIds: [],
            dataParams: { orgUnitPaths: ["/Global"] },
        };

        const aggregatedPayloadBuilder = new AggregatedPayloadBuilder(repositoryFactory, localInstance);
        const aggregatedDataExchangeExecutor = new AggregatedDataExchangeApiExecutor(localInstance);

        const sync = new AggregatedSyncUseCase(
            builder,
            repositoryFactory,
            localInstance,
            aggregatedPayloadBuilder,
            aggregatedDataExchangeExecutor
        );

        const payload = await aggregatedPayloadBuilder.build(builder);

        expect(payload.dataValues?.find(({ value }) => value === "test-value-1")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = local.db.dataValueSets.find(1);
        expect(response.dataValues[0].value).toEqual("test-value-1");
        expect(response.dataValues[0].dataElement).toEqual("id2");
    });
});

function buildRepositoryFactory(localInstance: Instance) {
    const repositoryFactory: DynamicRepositoryFactory = new DynamicRepositoryFactory();

    registerDynamicRepositoriesInFactory(localInstance, repositoryFactory);

    return repositoryFactory;
}

export {};
