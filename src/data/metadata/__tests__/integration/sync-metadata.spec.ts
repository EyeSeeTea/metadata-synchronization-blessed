import { Request, Server } from "miragejs";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { Repositories, RepositoryFactory } from "../../../../domain/common/factories/RepositoryFactory";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataSyncUseCase } from "../../../../domain/metadata/usecases/MetadataSyncUseCase";
import { SynchronizationBuilder } from "../../../../domain/synchronization/entities/SynchronizationBuilder";
import { startDhis } from "../../../../utils/dhisServer";
import { ConfigAppRepository } from "../../../config/ConfigAppRepository";
import { InstanceD2ApiRepository } from "../../../instance/InstanceD2ApiRepository";
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

        local.get("/metadata", async () => ({
            dataElements: [{ id: "id1", name: "Test data element 1" }],
        }));

        remote.get("/metadata", async () => ({
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

        const addMetadataToDb = async (schema: Schema<AnyRegistry>, request: Request) => {
            schema.db.metadata.insert(JSON.parse(request.requestBody));

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

        local.db.createCollection("metadata", []);
        local.post("/metadata", addMetadataToDb);

        remote.db.createCollection("metadata", []);
        remote.post("/metadata", addMetadataToDb);
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
            metadataIds: ["id1"],
            excludedIds: [],
        };

        const sync = new MetadataSyncUseCase(builder, repositoryFactory, localInstance);

        const payload = await sync.buildPayload();
        expect(payload.dataElements?.find(({ id }) => id === "id1")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = remote.db.metadata.find(1);
        expect(response.dataElements[0].id).toEqual("id1");
        expect(local.db.metadata.find(1)).toBeNull();
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
            metadataIds: ["id2"],
            excludedIds: [],
        };

        const sync = new MetadataSyncUseCase(builder, repositoryFactory, localInstance);

        const payload = await sync.buildPayload();
        expect(payload.dataElements?.find(({ id }) => id === "id2")).toBeDefined();

        for await (const _sync of sync.execute()) {
            // no-op
        }

        const response = local.db.metadata.find(1);
        expect(response.dataElements[0].id).toEqual("id2");
        expect(remote.db.metadata.find(1)).toBeNull();
    });
});

function buildRepositoryFactory() {
    const repositoryFactory: RepositoryFactory = new RepositoryFactory("");
    repositoryFactory.bind(Repositories.InstanceRepository, InstanceD2ApiRepository);
    repositoryFactory.bind(Repositories.ConfigRepository, ConfigAppRepository);
    repositoryFactory.bind(Repositories.MetadataRepository, MetadataD2ApiRepository);
    repositoryFactory.bind(Repositories.TransformationRepository, TransformationD2ApiRepository);
    return repositoryFactory;
}

export {};
