import { StorageClientFactory } from "../../data/config/StorageClientFactory";
import { FutureData } from "../common/entities/Future";
import { StorageClient } from "../storage/repositories/StorageClient";
import { Settings } from "./Settings";

export interface SettingsRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory): SettingsRepository;
}

export interface SettingsRepository {
    get(storageClient: StorageClient): FutureData<Settings>;
    save(settings: Settings, storageClient: StorageClient): FutureData<void>;
}
