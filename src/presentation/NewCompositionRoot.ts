import { D2Api } from "@eyeseetea/d2-api/2.36";
import { GetStorageClientUseCase } from "../domain/storage-client-config/usecases/GetStorageClientUseCase";
import { SetStorageClientUseCase } from "../domain/storage-client-config/usecases/SetStorageConfigUseCase";
import { StorageClientRepository } from "../domain/storage-client-config/repositories/StorageClientRepository";
import { Instance } from "../domain/instance/entities/Instance";
import { StorageClientD2Repository } from "../data/config/StorageClientD2Repository";
import { StorageClientTestRepository } from "../data/config/StorageClientTestRepository";

export type NewCompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    configRepository: StorageClientRepository;
};

function getCompositionRoot(repositories: Repositories) {
    return {
        config: {
            getStorage: new GetStorageClientUseCase(repositories.configRepository),
            setStorage: new SetStorageClientUseCase(repositories.configRepository),
        },
    };
}

export function getWebappCompositionRoot(api: D2Api, instance: Instance) {
    const repositories: Repositories = {
        configRepository: new StorageClientD2Repository(instance),
    };

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot() {
    const repositories: Repositories = {
        configRepository: new StorageClientTestRepository(),
    };

    return getCompositionRoot(repositories);
}
