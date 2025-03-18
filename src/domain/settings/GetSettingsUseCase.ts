import { FutureData } from "../common/entities/Future";
import { StorageClientRepository } from "../storage-client-config/repositories/StorageClientRepository";
import { Settings } from "./Settings";
import { SettingsRepository } from "./SettingsRepository";

export class GetSettingsUseCase {
    constructor(
        private options: { settingsRepository: SettingsRepository; storageClientRepository: StorageClientRepository }
    ) {}

    public execute(): FutureData<Settings> {
        return this.options.storageClientRepository.getStorageClient().flatMap(storageClient => {
            return this.options.settingsRepository.get(storageClient);
        });
    }
}
