import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { SynchronizationRuleData } from "../../../domain/rules/entities/SynchronizationRule";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

export interface OldSynchronizationRuleDetails {
    builder: {
        syncParams?: {
            includeSharingSettings: boolean;
            removeOrgUnitReferences: boolean;
            removeUserObjects?: boolean;
            removeUserObjectsAndReferences?: boolean;
            removeOrgUnitObjects?: boolean;
        };
    };
}

export interface NewSynchronizationRuleDetails {
    builder: {
        syncParams?: {
            includeSharingSettingsObjectsAndReferences: boolean;
            includeOnlySharingSettingsReferences: boolean;
            includeUsersObjectsAndReferences: boolean;
            includeOnlyUsersReferences: boolean;
            includeOrgUnitsObjectsAndReferences: boolean;
            includeOnlyOrgUnitsReferences: boolean;
        };
    };
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldRules = (await storage.get<SynchronizationRuleData[]>("rules")) ?? [];
    const oldMetadataRules = oldRules.filter(rule => rule.type === "metadata");

    await promiseMap(oldMetadataRules, async oldRule => {
        const oldRuleDetails = await storage.get<OldSynchronizationRuleDetails>("rules-" + oldRule.id);

        if (oldRuleDetails && oldRuleDetails.builder.syncParams) {
            const {
                includeSharingSettings: oldIncludeSharingSettings,
                removeUserObjects: oldRemoveUserObjects,
                removeUserObjectsAndReferences: oldRemoveUserObjectsAndReferences,
                removeOrgUnitObjects: oldRemoveOrgUnitObjects,
                removeOrgUnitReferences: oldRemoveOrgUnitReferences,
                ...restOldSyncParams
            } = oldRuleDetails.builder.syncParams;

            const newSyncParams = {
                ...restOldSyncParams,
                includeSharingSettingsObjectsAndReferences: oldIncludeSharingSettings,
                includeOnlySharingSettingsReferences: false,
                includeUsersObjectsAndReferences: !oldRemoveUserObjectsAndReferences && !oldRemoveUserObjects,
                includeOnlyUsersReferences: !!oldRemoveUserObjects,
                includeOrgUnitsObjectsAndReferences: !oldRemoveOrgUnitReferences && !oldRemoveOrgUnitObjects,
                includeOnlyOrgUnitsReferences: !!oldRemoveOrgUnitObjects,
            };

            const newRuleDatails: NewSynchronizationRuleDetails = {
                builder: { ...oldRuleDetails?.builder, syncParams: newSyncParams },
            };

            await storage.save("rules-" + oldRule.id, newRuleDatails);
        }
    });
}

const migration: Migration<MigrationParams> = {
    name: "Change include objects and references for sharing settings, users and org units",
    migrate,
};

export default migration;
