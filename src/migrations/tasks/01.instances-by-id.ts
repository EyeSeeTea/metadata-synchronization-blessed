import _ from "lodash";
import { D2Api } from "d2-api";

import { getDataStore, saveDataStore } from "../../models/dataStore";
import { promiseMap, getDuplicatedIds } from "../utils";
import { Maybe } from "../../types/utils";
import { Debug } from "../../types/migrations";

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

export default async function migrate(api: D2Api, debug: Debug): Promise<void> {
    const oldInstances = await getDataStore<InstanceOld[]>(api, "instances", []);
    const newInstances: InstanceNew[] = oldInstances.map(ins => _.omit(ins, ["metadataMapping"]));
    const duplicatedIds = getDuplicatedIds(oldInstances);
    const uniqueOldInstances = _.uniqBy(oldInstances, instance => instance.id);

    if (duplicatedIds.length > 0) debug(`[instances] Duplicate ids: ${duplicatedIds.join(", ")}`);

    await promiseMap(uniqueOldInstances, async oldInstance => {
        const newInstanceDatails: Maybe<InstanceDetailsNew> = {
            metadataMapping: oldInstance.metadataMapping || {},
        };
        debug(`Create details entry for instance ${oldInstance.id}`);
        await saveDataStore(api, "instances-" + oldInstance.id, newInstanceDatails);
    });

    debug(`Save main instances object`);
    await saveDataStore(api, "instances", newInstances);
}
