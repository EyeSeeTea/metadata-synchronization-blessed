import { Future, FutureData } from "../../domain/common/entities/Future";
import { DEFAULT_SETTINGS, Settings, SettingsData } from "../../domain/settings/Settings";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { StorageClientFactory } from "../config/StorageClientFactory";

import { Namespace } from "../storage/Namespaces";

export class SettingsD2ApiRepository implements SettingsRepository {
    constructor(private storageClientFactory: StorageClientFactory) {}

    get(): FutureData<Settings> {
        return this.getStorageClient().flatMap(storageClient => {
            return storageClient.getObjectFuture<SettingsData>(Namespace.SETTINGS).flatMap(settingsData => {
                if (!settingsData) {
                    return storageClient
                        .saveObjectFuture<SettingsData>(Namespace.SETTINGS, DEFAULT_SETTINGS)
                        .flatMap(() => {
                            return Future.success(
                                Settings.create({
                                    historyRetentionDays: DEFAULT_SETTINGS.historyRetentionDays?.toString(),
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
        });
    }

    save(settings: Settings): FutureData<void> {
        const data = {
            historyRetentionDays: settings.historyRetentionDays,
        };
        return this.getStorageClient().flatMap(storageClient => {
            return storageClient.saveObjectFuture<SettingsData>(Namespace.SETTINGS, data);
        });
    }

    private getStorageClient(): FutureData<StorageClient> {
        return this.storageClientFactory.getStorageClient();
    }
}
