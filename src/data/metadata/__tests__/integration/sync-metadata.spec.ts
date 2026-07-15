import { Request, Server } from "miragejs";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { DynamicRepositoryFactory } from "../../../../domain/common/factories/DynamicRepositoryFactory";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataPayloadBuilder } from "../../../../domain/metadata/builders/MetadataPayloadBuilder";
import { MetadataSyncUseCase } from "../../../../domain/metadata/usecases/MetadataSyncUseCase";
import { SynchronizationBuilder } from "../../../../domain/synchronization/entities/SynchronizationBuilder";
import { registerDynamicRepositoriesInFactory } from "../../../../presentation/CompositionRoot";
import { startDhis } from "../../../../utils/dhisServer";

const localInstance = Instance.build({
    url: "http://origin.test",
    name: "Testing",
    version: "2.36",
    type: "local",
});

const repositoryFactory = buildRepositoryFactory(localInstance);

describe("Sync metadata", () => {
    let local: Server;

    beforeEach(() => {
        local = startDhis({ urlPrefix: "http://origin.test" });

        local.get("/metadata", async () => ({
            dataElements: [{ id: "id1", name: "Test data element 1" }],
        }));

        local.get("/routes/DESTINATION/run/api/metadata", async () => ({
            dataElements: [{ id: "id2", name: "Test data element 2" }],
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

        local.get("/routes/DESTINATION/run/api/system/info", async () => ({ version: "2.36" }));

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

        const addMetadataToDb = async (schema: Schema<AnyRegistry>, request: Request, collection: string) => {
            schema.db[collection].insert(JSON.parse(request.requestBody));

            return {
                status: "OK",
                stats: { created: 0, updated: 5, deleted: 0, ignored: 0, total: 5 },
                typeReports: [
                    {
                        klass: "org.hisp.dhis.category.Category",
                        stats: { created: 0, updated: 1, deleted: 0, ignored: 0, total: 1 },
                        objectReports: [
                            {
                                klass: "org.hisp.dhis.category.Category",
                                index: 0,
                                uid: "J2EQ3575tpG",
                            },
                        ],
                    },
                ],
            };
        };

        local.db.createCollection("metadataLocal", []);
        local.post("/metadata", (schema, request) => addMetadataToDb(schema, request, "metadataLocal"));

        local.db.createCollection("metadataDestination", []);
        local.post("/routes/DESTINATION/run/api/metadata", (schema, request) =>
            addMetadataToDb(schema, request, "metadataDestination")
        );
    });

    afterEach(() => {
        local.shutdown();
    });

    it("Local server to remote - same version", async () => {
        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["id1"],
            excludedIds: [],
        };

        const metadataPayloadBuilder = new MetadataPayloadBuilder(repositoryFactory, localInstance);

        const sync = new MetadataSyncUseCase(builder, repositoryFactory, localInstance, metadataPayloadBuilder);

        const payload = await metadataPayloadBuilder.build(builder);
        expect(payload.dataElements?.find(({ id }) => id === "id1")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = local.db.metadataDestination.find(1);
        expect(response.dataElements[0].id).toEqual("id1");
        expect(local.db.metadataLocal.find(1)).toBeNull();
    });

    it("Remote server to local - same version", async () => {
        const builder: SynchronizationBuilder = {
            originInstance: "DESTINATION",
            targetInstances: ["LOCAL"],
            metadataIds: ["id2"],
            excludedIds: [],
        };

        const metadataPayloadBuilder = new MetadataPayloadBuilder(repositoryFactory, localInstance);

        const sync = new MetadataSyncUseCase(builder, repositoryFactory, localInstance, metadataPayloadBuilder);

        const payload = await metadataPayloadBuilder.build(builder);

        expect(payload.dataElements?.find(({ id }) => id === "id2")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = local.db.metadataLocal.find(1);
        expect(response.dataElements[0].id).toEqual("id2");
        expect(local.db.metadataDestination.find(1)).toBeNull();
    });
});

function buildRepositoryFactory(localInstance: Instance) {
    const repositoryFactory: DynamicRepositoryFactory = new DynamicRepositoryFactory();

    registerDynamicRepositoriesInFactory(localInstance, repositoryFactory);

    return repositoryFactory;
}

export {};
