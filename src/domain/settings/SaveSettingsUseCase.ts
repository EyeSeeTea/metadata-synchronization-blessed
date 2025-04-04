import { FutureData } from "../common/entities/Future";
import { Settings } from "./Settings";
import { SettingsRepository } from "./SettingsRepository";

export class SaveSettingsUseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    public execute(settings: Settings): FutureData<void> {
        return this.settingsRepository.save(settings);
    }
}
