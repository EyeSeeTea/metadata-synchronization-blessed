import { FutureData } from "../common/entities/Future";
import { StorageClientRepository } from "../storage-client-config/repositories/StorageClientRepository";
import { Settings } from "./Settings";
import { SettingsRepository } from "./SettingsRepository";

export class SaveSettingsUseCase {
    constructor(
        private options: { settingsRepository: SettingsRepository; storageClientRepository: StorageClientRepository }
    ) {}

    public execute(settings: Settings): FutureData<void> {
        return this.options.settingsRepository.save(settings);
    }
}
