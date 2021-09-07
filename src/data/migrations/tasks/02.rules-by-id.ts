import debug from "debug";
import _ from "lodash";
import { MigrationParams } from ".";
import { Id } from "../../../domain/common/entities/Schemas";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { Maybe } from "../../../types/utils";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";
import { getDuplicatedIds } from "../client/utils";

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

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldRules = (await storage.get<SynchronizationRuleOld[]>("rules")) ?? [];
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
        await storage.save("rules-" + oldRule.id, newRuleDetails);
    });

    debug(`Save main sync rules object`);
    await storage.save("rules", newRules);
}

const migration: Migration<MigrationParams> = { name: "Update sync rules ids", migrate };

export default migration;
