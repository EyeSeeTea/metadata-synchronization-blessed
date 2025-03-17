import { StorageClientFactory } from "../../data/config/StorageClientFactory";
import { Settings } from "./Settings";

export interface SettingsRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory): SettingsRepository;
}

export interface SettingsRepository {
    get(): Promise<Settings>;
    save(settings: Settings): Promise<void>;
}
