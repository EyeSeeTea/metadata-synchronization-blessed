import { ConfigRepository } from "../config/repositories/ConfigRepository";
import { Settings } from "./Settings";

export interface SettingsRepositoryConstructor {
    new (configRepository: ConfigRepository): SettingsRepository;
}

export interface SettingsRepository {
    get(): Promise<Settings>;
    save(settings: Settings): Promise<void>;
}
