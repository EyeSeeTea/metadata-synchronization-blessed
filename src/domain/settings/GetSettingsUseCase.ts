import { Settings } from "./Settings";
import { SettingsRepository } from "./SettingsRepository";

export class GetSettingsUseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    async execute(): Promise<Settings> {
        return this.settingsRepository.get();
    }
}
