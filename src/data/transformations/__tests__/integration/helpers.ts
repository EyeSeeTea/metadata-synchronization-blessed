import _ from "lodash";
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

let localInstance: Instance;

export function buildRepositoryFactory(version: string): DynamicRepositoryFactory {
    localInstance = Instance.build({
        url: "http://origin.test",
        name: "Testing",
        type: "local",
        version,
    });

    const repositoryFactory: DynamicRepositoryFactory = new DynamicRepositoryFactory();

    registerDynamicRepositoriesInFactory(localInstance, repositoryFactory);

    return repositoryFactory;
}

type Id = string;
type Model = string;
type Object = any;

export type Mapping = _.Dictionary<string | undefined>;

export type SyncResult = Record<Model, Record<Id, Object>>;

export async function sync({
    from,
    to,
    metadata,
    models,
}: {
    from: string;
    to: string;
    metadata: any;
    models: string[];
}): Promise<SyncResult> {
    const local = startDhis({ urlPrefix: "http://origin.test" }, { version: from });

    local.get("/metadata", async () => metadata);
    local.get("/programRules", async () => []);
    local.get("/routes/DESTINATION/run/metadata", async () => ({}));

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

    local.get("/routes/DESTINATION/run/api/system/info", () => ({ version: to }));

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
            stats: { created: 0, updated: 0, deleted: 0, ignored: 0, total: 0 },
            typeReports: [],
        };
    };

    local.db.createCollection("metadataLocal", []);
    local.post("/metadata", (schema: Schema<AnyRegistry>, request: Request) =>
        addMetadataToDb(schema, request, "metadataLocal")
    );

    local.db.createCollection("metadataDestination", []);
    local.post("/routes/DESTINATION/run/api/metadata", (schema: Schema<AnyRegistry>, request: Request) =>
        addMetadataToDb(schema, request, "metadataDestination")
    );

    const response = await executeMetadataSync(from, local, models);

    local.shutdown();

    return response;
}

export async function executeMetadataSync(
    fromVersion: string,
    local: Server,
    expectedModels: string[]
): Promise<SyncResult> {
    const repositoryFactory = buildRepositoryFactory(fromVersion);

    const builder: SynchronizationBuilder = {
        originInstance: "LOCAL",
        targetInstances: ["DESTINATION"],
        metadataIds: ["chart-line", "chart-over-line", "chart-over-column"],
        excludedIds: [],
    };

    const useCase = new MetadataSyncUseCase(
        builder,
        repositoryFactory,
        localInstance,
        new MetadataPayloadBuilder(repositoryFactory, localInstance)
    );

    let done = false;
    for await (const sync of useCase.execute()) {
        done = !!sync.done;
    }
    expect(done).toBeTruthy();

    expect(local.db.metadataLocal.where({})).toHaveLength(0);

    const payloads = local.db.metadataDestination.where({});
    expect(payloads).toHaveLength(1);

    const payload = payloads[0];
    expectedModels.forEach(expectedModel => {
        expect(_.keys(payload)).toContain(expectedModel);
    });

    return _.mapValues(payload, objects => _.keyBy(objects, obj => obj.id));
}

export function isKeyOf<T>(obj: T, key: keyof any): key is keyof T {
    return _.has(obj, key);
}
