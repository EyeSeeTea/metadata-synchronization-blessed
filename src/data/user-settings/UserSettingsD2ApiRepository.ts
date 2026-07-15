import { Future, FutureData } from "../../domain/common/entities/Future";

import { Namespace } from "../storage/Namespaces";
import { Instance } from "../../domain/instance/entities/Instance";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
import { DEFAULT_USER_SETTINGS, UserSettings, UserSettingsProps } from "../../domain/user-settings/UserSettings";
import { UserSettingsRepository } from "../../domain/user-settings/UserSettingsRepository";

export class UserSettingsD2ApiRepository implements UserSettingsRepository {
    private dataStoreClient: StorageDataStoreClient;
    constructor(private instance: Instance) {
        this.dataStoreClient = new StorageDataStoreClient(this.instance, undefined, undefined, {
            storageType: "user",
        });
    }

    get(): FutureData<UserSettings> {
        return this.dataStoreClient
            .getObjectFuture<UserSettingsProps>(Namespace.USER_SETTINGS)
            .flatMap(userSettings => {
                if (!userSettings) {
                    return this.dataStoreClient
                        .saveObjectFuture<UserSettingsProps>(Namespace.USER_SETTINGS, DEFAULT_USER_SETTINGS)
                        .flatMap(() => {
                            return Future.success(UserSettings.create(DEFAULT_USER_SETTINGS));
                        });
                } else {
                    return Future.success(UserSettings.create(userSettings));
                }
            });
    }

    save(userSettings: UserSettings): FutureData<void> {
        return this.dataStoreClient.saveObjectFuture<UserSettingsProps>(
            Namespace.USER_SETTINGS,
            userSettings._getAttributes()
        );
    }
}
