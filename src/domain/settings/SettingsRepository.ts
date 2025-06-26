import { FutureData } from "../common/entities/Future";
import { Settings } from "./Settings";

export interface SettingsRepository {
    get(): FutureData<Settings>;
    save(settings: Settings): FutureData<void>;
}
