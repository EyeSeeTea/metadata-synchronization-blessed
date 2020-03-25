import { D2Api } from "d2-api";
import { dataStoreNamespace, dataStoreVersion } from "../models/dataStore";

type Maybe<T> = T | undefined | null;

export const initializeDataStoreMigrations = async (api: D2Api) => {
    const { version = 0, ...rest } =
        (await api
            .dataStore(dataStoreNamespace)
            .get<Maybe<{ version?: number }>>("_dataStore")
            .getData()) ?? {};

    // TODO: Apply migrations(remoteVersion: number, currentVersion: number); Incremental?
    if (version !== dataStoreVersion) {
        console.debug("Applying dataStore migrations", { version, current: dataStoreVersion });
    }

    await api
        .dataStore(dataStoreNamespace)
        .save("_dataStore", { version: dataStoreVersion, ...rest })
        .getData();
};
