import _ from "lodash";
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
import { MetadataD2ApiRepository } from "../../../metadata/MetadataD2ApiRepository";
import { TransformationD2ApiRepository } from "../../../transformations/TransformationD2ApiRepository";

export function buildRepositoryFactory() {
    const repositoryFactory: RepositoryFactory = new RepositoryFactory("");
    repositoryFactory.bind(Repositories.InstanceRepository, InstanceD2ApiRepository);
    repositoryFactory.bind(Repositories.ConfigRepository, ConfigAppRepository);
    repositoryFactory.bind(Repositories.MetadataRepository, MetadataD2ApiRepository);
    repositoryFactory.bind(Repositories.TransformationRepository, TransformationD2ApiRepository);
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
    const remote = startDhis({ urlPrefix: "http://destination.test", pretender: local.pretender }, { version: to });

    local.get("/metadata", async () => metadata);
    local.get("/programRules", async () => []);
    remote.get("/metadata", async () => ({}));

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
            stats: { created: 0, updated: 0, deleted: 0, ignored: 0, total: 0 },
            typeReports: [],
        };
    };

    local.db.createCollection("metadata", []);
    local.post("/metadata", addMetadataToDb);

    remote.db.createCollection("metadata", []);
    remote.post("/metadata", addMetadataToDb);

    const response = await executeMetadataSync(from, local, remote, models);

    local.shutdown();
    remote.shutdown();

    return response;
}

export async function executeMetadataSync(
    fromVersion: string,
    local: Server,
    remote: Server,
    expectedModels: string[]
): Promise<SyncResult> {
    const repositoryFactory = buildRepositoryFactory();

    const localInstance = Instance.build({
        url: "http://origin.test",
        name: "Testing",
        version: fromVersion,
    });

    const builder: SynchronizationBuilder = {
        originInstance: "LOCAL",
        targetInstances: ["DESTINATION"],
        metadataIds: ["chart-line", "chart-over-line", "chart-over-column"],
        excludedIds: [],
    };

    const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance);

    let done = false;
    for await (const sync of useCase.execute()) {
        done = !!sync.done;
    }
    expect(done).toBeTruthy();

    expect(local.db.metadata.where({})).toHaveLength(0);

    const payloads = remote.db.metadata.where({});
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
