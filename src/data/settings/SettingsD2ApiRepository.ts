import { Future, FutureData } from "../../domain/common/entities/Future";
import { Settings, SettingsData } from "../../domain/settings/Settings";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";

import { Namespace } from "../storage/Namespaces";

export class SettingsD2ApiRepository implements SettingsRepository {
    get(storageClient: StorageClient): FutureData<Settings> {
        return storageClient.getObjectFuture<SettingsData>(Namespace.SETTINGS).flatMap(settingsData => {
            if (!settingsData) {
                const defaultSettings = {
                    historyRetentionDays: 30,
                }; //Set default history retention days to 30 days
                return storageClient.saveObjectFuture<SettingsData>(Namespace.SETTINGS, defaultSettings).flatMap(() => {
                    return Future.success(
                        Settings.create({
                            historyRetentionDays: defaultSettings.historyRetentionDays?.toString(),
                        }).getOrThrow()
                    );
                });
            } else {
                return Future.success(
                    Settings.create({
                        historyRetentionDays: settingsData.historyRetentionDays?.toString(),
                    }).getOrThrow()
                );
            }
        });
    }

    save(settings: Settings, storageClient: StorageClient): FutureData<void> {
        const data = {
            historyRetentionDays: settings.historyRetentionDays,
        };
        return storageClient.saveObjectFuture<SettingsData>(Namespace.SETTINGS, data);
    }
}
