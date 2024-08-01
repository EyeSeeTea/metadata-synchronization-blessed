import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { Settings, SettingsData } from "../../domain/settings/Settings";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { Namespace } from "../storage/Namespaces";

export class SettingsD2ApiRepository implements SettingsRepository {
    constructor(private configRepository: ConfigRepository) {}

    async get(): Promise<Settings> {
        const storageClient = await this.getStorageClient();
        const settingsData = await storageClient.getObject<SettingsData>(Namespace.SETTINGS);

        return settingsData
            ? Settings.create({ historyRetentionDays: settingsData.historyRetentionDays?.toString() }).getOrThrow()
            : Settings.create({ historyRetentionDays: undefined }).getOrThrow();
    }

    async save(settings: Settings): Promise<void> {
        const data = {
            historyRetentionDays: settings.historyRetentionDays,
        };

        const storageClient = await this.getStorageClient();
        await storageClient.saveObject<SettingsData>(Namespace.SETTINGS, data);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
