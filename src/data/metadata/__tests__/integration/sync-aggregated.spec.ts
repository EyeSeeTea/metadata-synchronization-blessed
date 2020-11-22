import { Request, Server } from "miragejs";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { AggregatedSyncUseCase } from "../../../../domain/aggregated/usecases/AggregatedSyncUseCase";
import { RepositoryFactory } from "../../../../domain/common/factories/RepositoryFactory";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { Repositories } from "../../../../domain/Repositories";
import { SynchronizationBuilder } from "../../../../types/synchronization";
import { startDhis } from "../../../../utils/dhisServer";
import { AggregatedD2ApiRepository } from "../../../aggregated/AggregatedD2ApiRepository";
import { InstanceD2ApiRepository } from "../../../instance/InstanceD2ApiRepository";
import { StorageDataStoreRepository } from "../../../storage/StorageDataStoreRepository";
import { TransformationD2ApiRepository } from "../../../transformations/TransformationD2ApiRepository";
import { MetadataD2ApiRepository } from "../../MetadataD2ApiRepository";

const repositoryFactory = buildRepositoryFactory();

describe("Sync metadata", () => {
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
            if (request.queryParams.filter === "id:in:[dataSet1]")
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

            if (request.queryParams.filter === "code:eq:default")
                return {
                    categoryOptions: [{ id: "default1" }],
                    categories: [{ id: "default2" }],
                    categoryCombos: [{ id: "default3" }],
                    categoryOptionCombos: [{ id: "default4" }],
                };

            console.log("Unknown metadata request", request.queryParams);
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
                id: "DESTINATION",
                name: "Destination test",
                url: "http://destination.test",
                username: "test",
                password: "",
                description: "",
            },
        ]);

        local.get("/dataStore/metadata-synchronization/instances-DESTINATION", async () => ({
            metadataMapping: {
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
            version: "2.30",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["dataSet1"],
            excludedIds: [],
        };

        const sync = new AggregatedSyncUseCase(builder, repositoryFactory, localInstance, "");

        const payload = await sync.buildPayload();
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
            version: "2.30",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "DESTINATION",
            targetInstances: ["LOCAL"],
            metadataIds: ["dataSet1"],
            excludedIds: [],
        };

        const sync = new AggregatedSyncUseCase(builder, repositoryFactory, localInstance, "");

        const payload = await sync.buildPayload();
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
    const repositoryFactory: RepositoryFactory = new RepositoryFactory();
    repositoryFactory.bind(Repositories.InstanceRepository, InstanceD2ApiRepository);
    repositoryFactory.bind(Repositories.StorageRepository, StorageDataStoreRepository);
    repositoryFactory.bind(Repositories.MetadataRepository, MetadataD2ApiRepository);
    repositoryFactory.bind(Repositories.AggregatedRepository, AggregatedD2ApiRepository);
    repositoryFactory.bind(Repositories.TransformationRepository, TransformationD2ApiRepository);
    return repositoryFactory;
}

export {};
