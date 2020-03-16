import { D2Api } from "d2-api";
import { dataStoreNamespace, dataStoreVersion } from "../models/dataStore";

export const initializeDataStoreMigrations = async (api: D2Api) => {
    const { version = 0, ...rest } =
        (await api
            .dataStore(dataStoreNamespace)
            .get("_dataStore")
            .getData()) ?? ({} as any);

    // TODO: Apply migrations(remoteVersion: number, currentVersion: number); Incremental?
    console.debug("Applying dataStore migragrions", { version, current: dataStoreVersion });

    await api
        .dataStore(dataStoreNamespace)
        .save("_dataStore", { version: dataStoreVersion, ...rest })
        .getData();
};
