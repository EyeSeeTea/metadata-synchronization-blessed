import { MigrationParams } from ".";
import { MetadataIncludeExcludeRules } from "../../../domain/metadata/entities/MetadataExcludeIncludeRules";
import { MetadataImportParams } from "../../../domain/metadata/entities/MetadataSynchronizationParams";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { SynchronizationType } from "../../../domain/synchronization/entities/SynchronizationType";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

export interface OldSynchronizationRuleData {
    id: string;
    type: SynchronizationType;
}

export interface OldSynchronizationBuilder {
    syncParams?: OldMetadataSynchronizationParams;
}

export interface OldMetadataSynchronizationParams extends MetadataImportParams {
    enableMapping: boolean;
    includeSharingSettings: boolean;
    removeOrgUnitReferences: boolean;
    removeUserObjects?: boolean;
    removeUserObjectsAndReferences?: boolean;
    removeOrgUnitObjects?: boolean;
    useDefaultIncludeExclude: boolean;
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}

export interface OldSynchronizationRuleDetails {
    builder: OldSynchronizationBuilder;
}

export interface NewSynchronizationRuleDetails {
    builder: NewSynchronizationBuilder;
}

export interface NewSynchronizationBuilder {
    syncParams?: NewMetadataSynchronizationParams;
}

export interface NewMetadataSynchronizationParams extends OldMetadataSynchronizationParams {
    metadataModelsSyncAll: string[]; //TODO: keyof MetadataEntities 963#discussion_r1682370900
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldRules = (await storage.get<OldSynchronizationRuleData[]>("rules")) ?? [];
    const oldEventRules = oldRules.filter(rule => rule.type === "metadata");

    await promiseMap(oldEventRules, async oldRule => {
        const oldRuleDetails = await storage.get<OldSynchronizationRuleDetails>("rules-" + oldRule.id);

        if (oldRuleDetails) {
            const oldSyncParams = oldRuleDetails.builder.syncParams;
            if (!oldSyncParams) return;

            const newSyncParams: NewMetadataSynchronizationParams = { ...oldSyncParams, metadataModelsSyncAll: [] };

            const newRuleDatails: NewSynchronizationRuleDetails = {
                builder: { ...oldRuleDetails?.builder, syncParams: newSyncParams },
            };

            await storage.save("rules-" + oldRule.id, newRuleDatails);
        }
    });
}

const migration: Migration<MigrationParams> = {
    name: "Create in existed metadata rules a new field metadataModelsSyncAll to []",
    migrate,
};

export default migration;
