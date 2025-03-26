import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { SynchronizationType } from "../../../domain/synchronization/entities/SynchronizationType";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

export interface SynchronizationRuleData {
    id: string;
    type: SynchronizationType;
}

export interface OldSynchronizationRuleDetails {
    builder: {
        syncParams?: {
            metadataIncludeExcludeRules?: OldMetadataIncludeExcludeRules;
            useDefaultIncludeExclude: boolean;
        };
    };
}

export interface OldExcludeIncludeRules {
    excludeRules: string[];
    includeRules: string[];
}

export interface OldMetadataIncludeExcludeRules {
    [metadataType: string]: OldExcludeIncludeRules;
}

export interface NewSynchronizationRuleDetails {
    builder: {
        syncParams?: {
            metadataIncludeExcludeRules?: OldMetadataIncludeExcludeRules;
            useDefaultIncludeExclude: boolean;
        };
    };
}

export interface NewExcludeIncludeRules {
    excludeRules: string[];
    includeRules: string[];
    includeOnlyReferencesRules: string[];
    includeReferencesAndObjectsRules: string[];
}

export interface NewMetadataIncludeExcludeRules {
    [metadataType: string]: NewExcludeIncludeRules;
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldRules = (await storage.get<SynchronizationRuleData[]>("rules")) ?? [];
    const oldMetadataRules = oldRules.filter(rule => rule.type === "metadata");

    await promiseMap(oldMetadataRules, async oldRule => {
        const oldRuleDetails = await storage.get<OldSynchronizationRuleDetails>("rules-" + oldRule.id);

        if (
            oldRuleDetails &&
            oldRuleDetails.builder.syncParams?.useDefaultIncludeExclude === false &&
            oldRuleDetails.builder.syncParams?.metadataIncludeExcludeRules
        ) {
            const fixedMetadataIncludeExcludeRules = Object.fromEntries(
                Object.entries(oldRuleDetails.builder.syncParams.metadataIncludeExcludeRules).map(([key, value]) => {
                    return [
                        key,
                        {
                            excludeRules: value.excludeRules,
                            includeRules: value.includeRules,
                            includeOnlyReferencesRules: [],
                            includeReferencesAndObjectsRules: value.includeRules,
                        },
                    ];
                })
            );

            const newSyncParams = {
                ...oldRuleDetails.builder.syncParams,
                metadataIncludeExcludeRules: fixedMetadataIncludeExcludeRules,
            };

            const newRuleDatails: NewSynchronizationRuleDetails = {
                builder: { ...oldRuleDetails?.builder, syncParams: newSyncParams },
            };

            await storage.save("rules-" + oldRule.id, newRuleDatails);
        }
    });
}

const migration: Migration<MigrationParams> = {
    name: "Add new fields to metadataIncludeExcludeRules",
    migrate,
};

export default migration;
