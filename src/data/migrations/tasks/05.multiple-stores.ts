import { generateUid } from "d2/uid";
import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { Store } from "../../../domain/stores/entities/Store";
import { AppStorage, Migration } from "../client/types";

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldKey = "store";
    const newKey = "stores";

    const oldContents = await storage.get<Store>(oldKey);

    if (oldContents) {
        const newContents = [{ ...oldContents, id: generateUid(), default: true }];

        await storage.save(newKey, newContents);
        await storage.remove(oldKey);
    }
}

const migration: Migration<MigrationParams> = { name: "Update history notifications", migrate };

export default migration;
