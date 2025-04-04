import { FutureData } from "../common/entities/Future";
import { StorageClientRepository } from "../storage-client-config/repositories/StorageClientRepository";
import { Settings } from "./Settings";
import { SettingsRepository } from "./SettingsRepository";

export class GetSettingsUseCase {
    constructor(
        private settingsRepository: SettingsRepository,
        private storageClientRepository: StorageClientRepository
    ) {}

    public execute(): FutureData<Settings> {
        return this.settingsRepository.get();
    }
}
