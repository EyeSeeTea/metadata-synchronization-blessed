import { D2Api } from "@eyeseetea/d2-api/2.36";
import { GetStorageClientUseCase } from "../domain/storage-client-config/usecases/GetStorageClientUseCase";
import { SetStorageClientUseCase } from "../domain/storage-client-config/usecases/SetStorageConfigUseCase";
import { StorageClientRepository } from "../domain/storage-client-config/repositories/StorageClientRepository";
import { Instance } from "../domain/instance/entities/Instance";
import { StorageClientD2Repository } from "../data/config/StorageClientD2Repository";
/**
 * @description This file is refactored
 */

export type NewCompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    storageClientRepository: StorageClientRepository;
};

function getCompositionRoot(repositories: Repositories) {
    return {
        config: {
            getStorageClient: new GetStorageClientUseCase(repositories.storageClientRepository),
            setStorageClient: new SetStorageClientUseCase(repositories.storageClientRepository),
        },
    };
}

export function getWebappCompositionRoot(api: D2Api, instance: Instance) {
    const repositories: Repositories = {
        storageClientRepository: new StorageClientD2Repository(instance),
    };

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot(repositories: Repositories) {
    return getCompositionRoot(repositories);
}
