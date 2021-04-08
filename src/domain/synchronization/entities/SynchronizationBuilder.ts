import { DataSynchronizationParams } from "../../aggregated/entities/DataSynchronizationParams";
import { FilterRule } from "../../metadata/entities/FilterRule";
import { MetadataSynchronizationParams } from "../../metadata/entities/MetadataSynchronizationParams";

export interface SynchronizationBuilder {
    originInstance: string;
    targetInstances: string[];
    metadataIds: string[];
    filterRules?: FilterRule[];
    excludedIds: string[];
    metadataTypes?: string[];
    syncRule?: string;
    syncParams?: MetadataSynchronizationParams;
    dataParams?: DataSynchronizationParams;
}

// TODO: When migration to fully defined schemas, this should be removed and use Schema.decode instead
export const defaultSynchronizationBuilder: SynchronizationBuilder = {
    originInstance: "LOCAL",
    targetInstances: [],
    metadataIds: [],
    filterRules: [],
    excludedIds: [],
    metadataTypes: [],
    dataParams: {
        strategy: "NEW_AND_UPDATES",
        allAttributeCategoryOptions: true,
        dryRun: false,
        allEvents: true,
        enableAggregation: false,
        aggregationType: undefined,
    },
    syncParams: {
        importStrategy: "CREATE_AND_UPDATE",
        enableMapping: false,
        includeSharingSettings: true,
        removeOrgUnitReferences: false,
        useDefaultIncludeExclude: true,
        atomicMode: "ALL",
        mergeMode: "MERGE",
        importMode: "COMMIT",
    },
};
