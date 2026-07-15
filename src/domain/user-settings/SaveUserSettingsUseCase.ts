import { FutureData } from "../common/entities/Future";
import { UserSettings } from "./UserSettings";
import { UserSettingsRepository } from "./UserSettingsRepository";

export class SaveUserSettingsUseCase {
    constructor(private userSettingsRepository: UserSettingsRepository) {}

    public execute(userSettings: UserSettings): FutureData<void> {
        return this.userSettingsRepository.save(userSettings);
    }
}
