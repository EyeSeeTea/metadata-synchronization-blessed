import { SyncRuleJobConfig } from "../../../domain/scheduler/entities/SyncRuleJobConfig";

export function getSyncRuleJobConfig(): SyncRuleJobConfig {
    return {
        id: "sync-rule-id",
        name: "Sync Rule",
        frequency: "0 */2 * * * *",
    };
}
