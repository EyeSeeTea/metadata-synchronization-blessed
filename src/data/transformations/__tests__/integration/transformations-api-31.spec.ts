import { Request, Server } from "miragejs";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { startDhis } from "../../../../../config/dhisServer";
import { RepositoryFactory } from "../../../../domain/common/factories/RepositoryFactory";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataSyncUseCase } from "../../../../domain/metadata/usecases/MetadataSyncUseCase";
import { Repositories } from "../../../../domain/Repositories";
import { SynchronizationBuilder } from "../../../../types/synchronization";
import { InstanceD2ApiRepository } from "../../../instance/InstanceD2ApiRepository";
import { MetadataD2ApiRepository } from "../../../metadata/MetadataD2ApiRepository";
import { StorageDataStoreRepository } from "../../../storage/StorageDataStoreRepository";
import { TransformationD2ApiRepository } from "../../../transformations/TransformationD2ApiRepository";

const repositoryFactory = buildRepositoryFactory();

describe("Sync metadata", () => {
    let local: Server;
    let remote: Server;

    beforeAll(() => {
        jest.setTimeout(30000);
    });

    beforeEach(() => {
        local = startDhis({ urlPrefix: "http://origin.test" });
        remote = startDhis(
            {
                urlPrefix: "http://destination.test",
                pretender: local.pretender,
            },
            { version: "2.31" }
        );

        local.get("/metadata", async () => ({
            programs: [
                {
                    id: "id1",
                    name: "Test tracker program",
                    captureCoordinates: true,
                },
                {
                    id: "id2",
                    name: "Test tracker program",
                    captureCoordinates: false,
                },
            ],
        }));

        remote.get("/metadata", async () => ({}));

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

        const addMetadataToDb = async (schema: Schema<AnyRegistry>, request: Request) => {
            schema.db.metadata.insert(JSON.parse(request.requestBody));

            return {
                status: "OK",
                stats: { created: 1, updated: 0, deleted: 0, ignored: 0, total: 1 },
                typeReports: [],
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

    it("Local server to remote - program captureCoordinates true to featureType POINT - API 30 to API 31", async () => {
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

        const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance, "");

        const payload = await useCase.buildPayload();
        expect(payload.programs?.find(({ id }) => id === "id1")).toBeDefined();

        for await (const { done } of useCase.execute()) {
            if (done) console.log("Done");
        }

        // Assert object has been created on remote
        const response = remote.db.metadata.find(1);
        expect(response.programs[0].id).toEqual("id1");
        expect(response.programs[0].name).toEqual("Test tracker program");

        // Assert new properties have the correct values
        expect(response.programs[0].featureType).toEqual("POINT");

        // Assert old properties are not anymore
        expect(response.programs[0].captureCoordinates).toBeUndefined();

        // Assert we have not updated local metadata
        expect(local.db.metadata.find(1)).toBeNull();
    });

    it("Local server to remote - program captureCoordinates false to featureType NONE - API 30 to API 31", async () => {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.30",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["id2"],
            excludedIds: [],
        };

        const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance, "");

        const payload = await useCase.buildPayload();
        expect(payload.programs?.find(({ id }) => id === "id2")).toBeDefined();

        for await (const { done } of useCase.execute()) {
            if (done) console.log("Done");
        }

        // Assert object has been created on remote
        const response = remote.db.metadata.find(1);
        expect(response.programs[1].id).toEqual("id2");
        expect(response.programs[1].name).toEqual("Test tracker program");

        // Assert new properties have the correct values
        expect(response.programs[1].featureType).toEqual("NONE");

        // Assert old properties are not anymore
        expect(response.programs[1].captureCoordinates).toBeUndefined();

        // Assert we have not updated local metadata
        expect(local.db.metadata.find(1)).toBeNull();
    });
});

function buildRepositoryFactory() {
    const repositoryFactory: RepositoryFactory = new RepositoryFactory();
    repositoryFactory.bind(Repositories.InstanceRepository, InstanceD2ApiRepository);
    repositoryFactory.bind(Repositories.StorageRepository, StorageDataStoreRepository);
    repositoryFactory.bind(Repositories.MetadataRepository, MetadataD2ApiRepository);
    repositoryFactory.bind(Repositories.TransformationRepository, TransformationD2ApiRepository);
    return repositoryFactory;
}

export {};
