import { GetStorageClientUseCase } from "../domain/storage-client-config/usecases/GetStorageClientUseCase";
import { SetStorageClientUseCase } from "../domain/storage-client-config/usecases/SetStorageConfigUseCase";
import { StorageClientRepository } from "../domain/storage-client-config/repositories/StorageClientRepository";
import { Instance } from "../domain/instance/entities/Instance";
import { StorageClientD2Repository } from "../data/config/StorageClientD2Repository";
import { SettingsRepository } from "../domain/settings/SettingsRepository";
import { GetSettingsUseCase } from "../domain/settings/GetSettingsUseCase";
import { SaveSettingsUseCase } from "../domain/settings/SaveSettingsUseCase";
import { SettingsD2ApiRepository } from "../data/settings/SettingsD2ApiRepository";

/**
 * @description This file is refactored
 */

export type NewCompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    storageClientRepository: StorageClientRepository;
    settingsRepository: SettingsRepository;
};

function getCompositionRoot(repositories: Repositories) {
    return {
        config: {
            getStorageClient: new GetStorageClientUseCase(repositories.storageClientRepository),
            setStorageClient: new SetStorageClientUseCase(repositories.storageClientRepository),
        },

        settings: {
            get: new GetSettingsUseCase(repositories.settingsRepository),
            save: new SaveSettingsUseCase(repositories.settingsRepository),
        },
    };
}

export function getWebappCompositionRoot(instance: Instance) {
    const storageClientRepository = new StorageClientD2Repository(instance);
    const repositories: Repositories = {
        storageClientRepository: new StorageClientD2Repository(instance),
        settingsRepository: new SettingsD2ApiRepository(storageClientRepository),
    };

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot(repositories: Repositories) {
    return getCompositionRoot(repositories);
}
