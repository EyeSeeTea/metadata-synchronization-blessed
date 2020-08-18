import { SynchronizationBuilder } from "./../../../../types/synchronization";
import _ from "lodash";
import { Server } from "miragejs";

import { Instance } from "../../../../domain/instance/entities/Instance";
import { RepositoryFactory } from "../../../../domain/common/factories/RepositoryFactory";
import { Repositories } from "../../../../domain/Repositories";
import { InstanceD2ApiRepository } from "../../../instance/InstanceD2ApiRepository";
import { MetadataD2ApiRepository } from "../../../metadata/MetadataD2ApiRepository";
import { StorageDataStoreRepository } from "../../../storage/StorageDataStoreRepository";
import { TransformationD2ApiRepository } from "../../../transformations/TransformationD2ApiRepository";
import { MetadataSyncUseCase } from "../../../../domain/metadata/usecases/MetadataSyncUseCase";

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

export async function executeMetadataSync(
    local: Server,
    remote: Server,
    expectedModels: string[]
): Promise<Record<Model, Record<Id, Object>>> {
    const repositoryFactory = buildRepositoryFactory();

    const localInstance = Instance.build({
        url: local.urlPrefix,
        name: "Testing",
        version: "2.31",
    });

    const builder: SynchronizationBuilder = {
        originInstance: "LOCAL",
        targetInstances: ["DESTINATION"],
        metadataIds: ["chart-line", "chart-over-line", "chart-over-column"],
        excludedIds: [],
    };

    const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance, "");

    for await (const { done } of useCase.execute()) {
        console.debug(done);
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
