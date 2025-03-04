import { StorageClientRepository } from "../storage-client-config/repositories/StorageClientRepository";
import { Settings } from "./Settings";

export interface SettingsRepositoryConstructor {
    new (configRepository: StorageClientRepository): SettingsRepository;
}

export interface SettingsRepository {
    get(): Promise<Settings>;
    save(settings: Settings): Promise<void>;
}
