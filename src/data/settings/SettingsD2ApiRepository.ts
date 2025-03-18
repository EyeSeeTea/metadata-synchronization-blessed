import { FutureData } from "../../domain/common/entities/Future";
import { Settings, SettingsData } from "../../domain/settings/Settings";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";

import { Namespace } from "../storage/Namespaces";

export class SettingsD2ApiRepository implements SettingsRepository {
    get(storageClient: StorageClient): FutureData<Settings> {
        return storageClient.getObjectFuture<SettingsData>(Namespace.SETTINGS).map(settingsData => {
            return settingsData
                ? Settings.create({ historyRetentionDays: settingsData.historyRetentionDays?.toString() }).getOrThrow()
                : Settings.create({ historyRetentionDays: undefined }).getOrThrow();
        });
    }

    save(settings: Settings, storageClient: StorageClient): FutureData<void> {
        const data = {
            historyRetentionDays: settings.historyRetentionDays,
        };
        return storageClient.saveObjectFuture<SettingsData>(Namespace.SETTINGS, data);
    }
}
