import { Settings } from "./Settings";
import { SettingsRepository } from "./SettingsRepository";

export class SaveSettingsUseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    async execute(settings: Settings): Promise<void> {
        return this.settingsRepository.save(settings);
    }
}
