import { SynchronizationBuilder } from "./../../../../types/synchronization";
import _ from "lodash";
import { Server, Request } from "miragejs";
import Schema from "miragejs/orm/schema";

import { Instance } from "../../../../domain/instance/entities/Instance";
import { RepositoryFactory } from "../../../../domain/common/factories/RepositoryFactory";
import { Repositories } from "../../../../domain/Repositories";
import { InstanceD2ApiRepository } from "../../../instance/InstanceD2ApiRepository";
import { MetadataD2ApiRepository } from "../../../metadata/MetadataD2ApiRepository";
import { StorageDataStoreRepository } from "../../../storage/StorageDataStoreClient";
import { TransformationD2ApiRepository } from "../../../transformations/TransformationD2ApiRepository";
import { MetadataSyncUseCase } from "../../../../domain/metadata/usecases/MetadataSyncUseCase";
import { AnyRegistry } from "miragejs/-types";
import { startDhis } from "../../../../utils/dhisServer";

export function buildRepositoryFactory() {
    const repositoryFactory: RepositoryFactory = new RepositoryFactory();
    repositoryFactory.bind(Repositories.InstanceRepository, InstanceD2ApiRepository);
    repositoryFactory.bind(Repositories.StorageRepository, StorageDataStoreRepository);
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
    const remote = startDhis(
        { urlPrefix: "http://destination.test", pretender: local.pretender },
        { version: to }
    );

    local.get("/metadata", async () => metadata);
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

    local.get("/dataStore/metadata-synchronization/instances-DESTINATION", async () => ({}));

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
        url: local.urlPrefix,
        name: "Testing",
        version: fromVersion,
    });

    const builder: SynchronizationBuilder = {
        originInstance: "LOCAL",
        targetInstances: ["DESTINATION"],
        metadataIds: ["chart-line", "chart-over-line", "chart-over-column"],
        excludedIds: [],
    };

    const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance, "");

    for await (const { done } of useCase.execute()) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        done;
    }

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
