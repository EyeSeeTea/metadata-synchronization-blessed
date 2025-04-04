import { StorageClientFactory } from "../../data/config/StorageClientFactory";
import { FutureData } from "../common/entities/Future";
import { Settings } from "./Settings";

export interface SettingsRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory): SettingsRepository;
}

export interface SettingsRepository {
    get(): FutureData<Settings>;
    save(settings: Settings): FutureData<void>;
}
