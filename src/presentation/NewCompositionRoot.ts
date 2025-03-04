import { D2Api } from "@eyeseetea/d2-api/2.36";
import { GetStorageConfigUseCase } from "../domain/config/usecases/GetStorageConfigUseCase";
import { SetStorageConfigUseCase } from "../domain/config/usecases/SetStorageConfigUseCase";
import { ConfigRepository } from "../domain/config/repositories/ConfigRepository";
import { Instance } from "../domain/instance/entities/Instance";
import { ConfigAppRepository } from "../data/config/ConfigAppRepository";
import { ConfigTestRepository } from "../data/config/ConfigTestRepository";

export type NewCompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    configRepository: ConfigRepository;
};

function getCompositionRoot(repositories: Repositories) {
    return {
        config: {
            getStorage: new GetStorageConfigUseCase(repositories.configRepository),
            setStorage: new SetStorageConfigUseCase(repositories.configRepository),
        },
    };
}

export function getWebappCompositionRoot(api: D2Api, instance: Instance) {
    const repositories: Repositories = {
        configRepository: new ConfigAppRepository(instance),
    };

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot() {
    const repositories: Repositories = {
        configRepository: new ConfigTestRepository(),
    };

    return getCompositionRoot(repositories);
}
