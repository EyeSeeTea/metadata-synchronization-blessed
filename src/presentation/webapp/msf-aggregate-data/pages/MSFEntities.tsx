import { ObjectWithPeriod } from "../../../react/core/components/period-selection/PeriodSelection";
import { NamedDate } from "../../../react/msf-aggregate-data/components/org-unit-date-selector/OrgUnitDateSelector";

export type RunAnalyticsSettings = "true" | "false" | "by-sync-rule-settings";

export type MSFSettings = {
    runAnalytics: RunAnalyticsSettings;
    analyticsYears: number;
    projectMinimumDates: Record<string, NamedDate>;
    deleteDataValuesBeforeSync?: boolean;
    checkInPreviousPeriods?: boolean;
    lastExecutions: Record<string, Date>;
};

export type PersistedMSFSettings = Omit<MSFSettings, "runAnalytics">;

export type AdvancedSettings = {
    period?: ObjectWithPeriod;
};

export const MSFStorageKey = "msf-storage";

export const defaultMSFSettings: MSFSettings = {
    runAnalytics: "by-sync-rule-settings",
    analyticsYears: 2,
    projectMinimumDates: {},
    deleteDataValuesBeforeSync: false,
    checkInPreviousPeriods: false,
    lastExecutions: {},
};
