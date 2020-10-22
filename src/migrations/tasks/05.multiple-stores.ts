import { generateUid } from "d2/uid";
import { Store } from "../../domain/packages/entities/Store";
import { deleteDataStore, saveDataStore } from "../../models/dataStore";
import { D2Api } from "../../types/d2-api";

export default async function migrate(api: D2Api): Promise<void> {
    const oldKey = "store";
    const newKey = "stores";

    const dataStore = api.dataStore("metadata-synchronization");
    const oldContents = await dataStore.get<Store>(oldKey).getData();

    if (oldContents) {
        const newContents = [{ ...oldContents, id: generateUid(), default: true }];

        await saveDataStore(api, newKey, newContents);
        await deleteDataStore(api, oldKey);
    }
}
