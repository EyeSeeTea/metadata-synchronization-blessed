import { SynchronizationRuleData } from "./entities/SynchronizationRule";

/** Rule JSON in the DHIS2 data store or in export files: ADEX entries are id refs only (full targets live in DHIS2). */
export type SynchronizationRulePersistedSnapshot = Omit<SynchronizationRuleData, "aggregatedDataExchanges"> & {
    aggregatedDataExchanges?: { id: string }[];
};

export function toSynchronizationRulePersistedSnapshot(
    data: SynchronizationRuleData
): SynchronizationRulePersistedSnapshot {
    return {
        ...data,
        aggregatedDataExchanges: (data.aggregatedDataExchanges || []).map(ade => ({ id: ade.id })),
    };
}
