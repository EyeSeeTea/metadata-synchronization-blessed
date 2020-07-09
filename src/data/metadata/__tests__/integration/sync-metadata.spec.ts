import { init } from "d2";
import { Server } from "miragejs";
import { startDhis } from "../../../../../config/dhisServer";
import { RepositoryFactory } from "../../../../domain/common/factories/RepositoryFactory";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataSyncUseCase } from "../../../../domain/metadata/usecases/MetadataSyncUseCase";
import { Repositories } from "../../../../domain/Repositories";
import { D2 } from "../../../../types/d2";
import { SynchronizationBuilder } from "../../../../types/synchronization";
import { InstanceD2ApiRepository } from "../../../instance/InstanceD2ApiRepository";
import { StorageDataStoreRepository } from "../../../storage/StorageDataStoreRepository";
import { TransformationD2ApiRepository } from "../../../transformations/TransformationD2ApiRepository";
import { MetadataD2ApiRepository } from "../../MetadataD2ApiRepository";

const repositoryFactory = buildRepositoryFactory();

describe("Sync metadata", () => {
    let origin: Server;
    let destination: Server;

    beforeEach(() => {
        origin = startDhis({ urlPrefix: "http://origin.test" });
        destination = startDhis({
            urlPrefix: "http://destination.test",
            pretender: origin.pretender,
        });

        origin.get("/metadata", async () => ({
            dataElements: [{ id: "id1", name: "Test data element" }],
        }));

        origin.get("/dataStore/metadata-synchronization/instances", async () => [
            {
                id: "DESTINATION",
                name: "Destination test",
                url: "http://destination.test",
                username: "test",
                password: "",
                description: "",
            },
        ]);

        destination.db.createCollection("metadata");
        destination.post("/metadata", async (schema, request) => {
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
        });
    });

    afterEach(() => {
        origin.shutdown();
        destination.shutdown();
    });

    it("Local server to remote - same version", async () => {
        const d2 = await init({ baseUrl: `http://origin.test/api` });

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

        const useCase = new MetadataSyncUseCase(
            d2 as D2,
            builder,
            repositoryFactory,
            localInstance,
            ""
        );

        const payload = await useCase.buildPayload();
        expect(payload.dataElements?.find(({ id }) => id === "id1")).toBeDefined();

        for await (const {} of useCase.execute()) {
        }
        
        const response = destination.db.metadata.find(1);
        expect(response.dataElements[0].id).toEqual("id1");
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
