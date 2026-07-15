import { FutureData } from "../common/entities/Future";
import { UserSettings } from "./UserSettings";
import { UserSettingsRepository } from "./UserSettingsRepository";

export class GetUserSettingsUseCase {
    constructor(private userSettingsRepository: UserSettingsRepository) {}

    public execute(): FutureData<UserSettings> {
        return this.userSettingsRepository.get();
    }
}
