// NOTICE: This is refactored

export type SyncRuleJobConfig = {
    id: string;
    name: string;
    frequency: string;
};

export const EVERY_MINUTE_FREQUENCY = "0 * * * * *";
