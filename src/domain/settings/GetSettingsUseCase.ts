import { FutureData } from "../common/entities/Future";
import { Settings } from "./Settings";
import { SettingsRepository } from "./SettingsRepository";

export class GetSettingsUseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    public execute(): FutureData<Settings> {
        return this.settingsRepository.get();
    }
}
