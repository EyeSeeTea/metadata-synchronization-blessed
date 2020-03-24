import _ from "lodash";
import { D2Api } from "d2-api";

import { getDataStore, saveDataStore } from "../../models/dataStore";
import { promiseMap, getDuplicatedIds } from "../utils";
import { Maybe } from "../../types/utils";

interface InstanceOld {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
    description?: string;
    metadataMapping?: MetadataMappingDictionary;
}

interface MetadataMappingDictionary {
    [model: string]: unknown;
}

type InstanceNew = Omit<InstanceOld, "metadataMapping">;

interface InstanceDetailsNew {
    metadataMapping: MetadataMappingDictionary;
}

export default async function migrate(api: D2Api): Promise<void> {
    const oldInstances = await getDataStore<InstanceOld[]>(api, "instances", []);
    const newInstances: InstanceNew[] = oldInstances.map(ins => _.omit(ins, ["metadataMapping"]));
    const duplicatedIds = getDuplicatedIds(oldInstances);

    if (duplicatedIds.length > 0)
        throw new Error(`[instances] Duplicate ids: ${duplicatedIds.join(", ")}`);

    await promiseMap(oldInstances, async oldInstance => {
        const newInstanceDatails: Maybe<InstanceDetailsNew> = {
            metadataMapping: oldInstance.metadataMapping || {},
        };
        await saveDataStore(api, "instances-" + oldInstance.id, newInstanceDatails);
    });

    await saveDataStore(api, "instances", newInstances);
}
