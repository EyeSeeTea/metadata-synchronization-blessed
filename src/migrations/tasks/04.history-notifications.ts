import { SynchronizationReportData } from "../../domain/reports/entities/SynchronizationReport";
import { deleteDataStore, getDataStore, saveDataStore } from "../../models/dataStore";
import { D2Api } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { Migration } from "../types";

async function migrate(api: D2Api): Promise<void> {
    const dataStoreKeys = await api.dataStore("metadata-synchronization").getKeys().getData();

    const notificationKeys = dataStoreKeys.filter(key => key.startsWith("notifications"));

    await promiseMap(notificationKeys, async key => {
        const contents = await getDataStore<SynchronizationReportData[]>(api, key, []);
        const newKey = key.replace("notifications", "history");
        await saveDataStore(api, newKey, contents);
        await deleteDataStore(api, key);
    });
}

const migration: Migration = { name: "Update history notifications", migrate };

export default migration;
