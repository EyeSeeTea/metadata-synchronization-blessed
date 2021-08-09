import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { SynchronizationReportData } from "../../../domain/reports/entities/SynchronizationReport";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const dataStoreKeys = await storage.listKeys();
    const notificationKeys = dataStoreKeys.filter(key => key.startsWith("notifications"));

    await promiseMap(notificationKeys, async key => {
        const contents = (await storage.get<SynchronizationReportData[]>(key)) ?? [];
        const newKey = key.replace("notifications", "history");
        await storage.save(newKey, contents);
        await storage.remove(key);
    });
}

const migration: Migration<MigrationParams> = { name: "Update history notifications", migrate };

export default migration;
