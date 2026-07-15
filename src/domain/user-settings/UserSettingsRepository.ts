import { FutureData } from "../common/entities/Future";
import { UserSettings } from "./UserSettings";

export interface UserSettingsRepository {
    get(): FutureData<UserSettings>;
    save(userSettings: UserSettings): FutureData<void>;
}
