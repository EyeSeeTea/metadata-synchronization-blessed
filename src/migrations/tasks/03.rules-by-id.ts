import _ from "lodash";
import { D2Api, Id } from "d2-api";

import { getDataStore, saveDataStore } from "../../models/dataStore";
import { promiseMap, getDuplicatedIds } from "../utils";
import { Maybe } from "../../types/utils";

type SynchronizationBuilder = { targetInstances: Id[] };

export interface SynchronizationRuleOld {
    id: string;
    builder: SynchronizationBuilder;
    targetInstances: Id[];
    [k: string]: unknown;
}

type SynchronizationRuleNew = Omit<SynchronizationRuleOld, "builder">;

interface SynchronizationRuleDetailsNew {
    builder: SynchronizationBuilder;
}

export default async function migrate(api: D2Api): Promise<void> {
    const oldRules = await getDataStore<SynchronizationRuleOld[]>(api, "rules", []);
    const newRules: SynchronizationRuleNew[] = oldRules.map(oldRule => ({
        ..._.omit(oldRule, ["builder"]),
        targetInstances: oldRule.builder.targetInstances,
    }));
    const duplicatedIds = getDuplicatedIds(oldRules);

    if (duplicatedIds.length > 0)
        throw new Error(`[rules] Duplicate ids: ${duplicatedIds.join(", ")}`);

    await promiseMap(oldRules, async oldRule => {
        const newRuleDetails: Maybe<SynchronizationRuleDetailsNew> = {
            builder: oldRule.builder,
        };
        await saveDataStore(api, "rules-" + oldRule.id, newRuleDetails);
    });

    await saveDataStore(api, "rules", newRules);
}
