import { SynchronizationRule, SynchronizationRuleData } from "../../../../domain/rules/entities/SynchronizationRule";

export function getSynchronizationRule(isSchedulerEnabled = false): SynchronizationRule {
    const data: SynchronizationRuleData = {
        id: "sync-rule-id",
        code: "Sync Rule",
        name: "Sync Rule",
        type: "metadata",
        user: { id: "user-id", name: "User Name" },
        created: new Date(),
        enabled: isSchedulerEnabled,
        schedulingFrequencyNeedsUpdate: false,
        frequency: "0 */2 * * * *",
        description: "Sync Rule",
        lastUpdated: new Date(),
        lastExecuted: new Date(),
        publicAccess: "rw------",
        userAccesses: [],
        lastUpdatedBy: { id: "user-id", name: "User Name" },
        lastExecutedBy: { id: "user-id", name: "User Name" },
        targetInstances: ["target-instance-id"],
        userGroupAccesses: [],
        lastSuccessfulSync: new Date(),
        builder: {
            dataParams: {
                dryRun: false,
                allTEIs: true,
                strategy: "NEW_AND_UPDATES",
                allEvents: true,
                enableAggregation: false,
                allAttributeCategoryOptions: true,
            },
            syncParams: {
                mergeMode: "MERGE",
                atomicMode: "ALL",
                importMode: "COMMIT",
                enableMapping: false,
                importStrategy: "CREATE_AND_UPDATE",
                metadataModelsSyncAll: [],
                includeSharingSettingsObjectsAndReferences: true,
                includeOnlySharingSettingsReferences: false,
                includeUsersObjectsAndReferences: true,
                includeOnlyUsersReferences: false,
                includeOrgUnitsObjectsAndReferences: true,
                includeOnlyOrgUnitsReferences: false,
                useDefaultIncludeExclude: true,
            },
            excludedIds: [],
            filterRules: [],
            metadataIds: ["metadata-ids"],
            metadataTypes: ["optionSets"],
            originInstance: "LOCAL",
            targetInstances: ["target-instance-id"],
        },
    };

    return SynchronizationRule.build(data);
}
