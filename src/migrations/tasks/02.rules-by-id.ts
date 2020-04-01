import { D2Api, Id } from "d2-api";
import _ from "lodash";
import { getDataStore, saveDataStore } from "../../models/dataStore";
import { Debug } from "../../types/migrations";
import { Maybe } from "../../types/utils";
import { promiseMap } from "../../utils/common";
import { getDuplicatedIds } from "../utils";

type SynchronizationBuilder = { targetInstances: Id[] };

export interface SynchronizationRuleOld {
    id: string;
    builder: SynchronizationBuilder;
    targetInstances: Id[];
}

type SynchronizationRuleNew = Omit<SynchronizationRuleOld, "builder">;

interface SynchronizationRuleDetailsNew {
    builder: SynchronizationBuilder;
}

export default async function migrate(api: D2Api, debug: Debug): Promise<void> {
    const oldRules = await getDataStore<SynchronizationRuleOld[]>(api, "rules", []);
    const newRules: SynchronizationRuleNew[] = oldRules.map(oldRule => ({
        ..._.omit(oldRule, ["builder"]),
        targetInstances: oldRule.builder.targetInstances,
    }));
    const duplicatedIds = getDuplicatedIds(oldRules);
    const uniqueOldRules = _.uniqBy(oldRules, rule => rule.id);

    if (duplicatedIds.length > 0) debug(`[rules] Duplicate ids: ${duplicatedIds.join(", ")}`);

    await promiseMap(uniqueOldRules, async oldRule => {
        const newRuleDetails: Maybe<SynchronizationRuleDetailsNew> = {
            builder: oldRule.builder,
        };
        debug(`Create details entry for sync rule ${oldRule.id}`);
        await saveDataStore(api, "rules-" + oldRule.id, newRuleDetails);
    });

    debug(`Save main sync rules object`);
    await saveDataStore(api, "rules", newRules);
}
