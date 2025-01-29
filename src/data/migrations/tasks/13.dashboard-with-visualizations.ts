import { MigrationParams } from ".";
import { MetadataIncludeExcludeRules } from "../../../domain/metadata/entities/MetadataExcludeIncludeRules";
import { MetadataImportParams } from "../../../domain/metadata/entities/MetadataSynchronizationParams";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { SynchronizationType } from "../../../domain/synchronization/entities/SynchronizationType";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

export interface SynchronizationRuleData {
    id: string;
    type: SynchronizationType;
}

export interface SynchronizationRuleDetails {
    builder: SynchronizationBuilder;
}

export interface SynchronizationBuilder {
    syncParams?: OldMetadataSynchronizationParams;
}

export interface OldMetadataSynchronizationParams extends MetadataImportParams {
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldRules = (await storage.get<SynchronizationRuleData[]>("rules")) ?? [];
    const oldMetadataRules = oldRules.filter(rule => rule.type === "metadata");

    await promiseMap(oldMetadataRules, async oldRule => {
        const oldRuleDetails = await storage.get<SynchronizationRuleDetails>("rules-" + oldRule.id);

        debugger;

        if (
            oldRuleDetails &&
            oldRuleDetails.builder.syncParams?.metadataIncludeExcludeRules &&
            oldRuleDetails.builder.syncParams.metadataIncludeExcludeRules["dashboard"] !== undefined
        ) {
            const fixedMetadataIncludeExcludeRules = Object.fromEntries(
                Object.entries(oldRuleDetails.builder.syncParams.metadataIncludeExcludeRules).map(([key, value]) => {
                    const fixRule = (rule: string) => {
                        const isVisualizationRule = rule.split(".")[0] === "charts";

                        return isVisualizationRule ? rule.replace("charts", "visualizations") : rule;
                    };

                    if (key === "dashboard") {
                        return [
                            key,
                            {
                                excludeRules: value.excludeRules.map(rule => fixRule(rule)),
                                includeRules: value.includeRules.map(rule => fixRule(rule)),
                            },
                        ];
                    } else {
                        return [key, value];
                    }
                })
            );

            const newSyncParams = {
                ...oldRuleDetails.builder.syncParams,
                metadataIncludeExcludeRules: fixedMetadataIncludeExcludeRules,
            };

            const newRuleDatails: SynchronizationRuleDetails = {
                builder: { ...oldRuleDetails?.builder, syncParams: newSyncParams },
            };

            await storage.save("rules-" + oldRule.id, newRuleDatails);
        }
    });
}

const migration: Migration<MigrationParams> = {
    name: "Fix missing dependencies to sync dashboards with visualizations",
    migrate,
};

export default migration;
