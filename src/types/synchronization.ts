import { DataSynchronizationParams } from "../domain/aggregated/types";
import { MetadataEntities } from "../domain/metadata/entities/MetadataEntities";
import { SynchronizationReport } from "../domain/reports/entities/SynchronizationReport";
import { MetadataImportParams } from "./d2";

export interface MetadataIncludeExcludeRules {
    [metadataType: string]: ExcludeIncludeRules;
}

export interface ExcludeIncludeRules {
    excludeRules: string[];
    includeRules: string[];
}

export interface MetadataSynchronizationParams extends MetadataImportParams {
    enableMapping: boolean;
    includeSharingSettings: boolean;
    removeOrgUnitReferences: boolean;
    useDefaultIncludeExclude: boolean;
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}

export type SynchronizationParams = MetadataSynchronizationParams | DataSynchronizationParams;

export interface ExportBuilder {
    type: keyof MetadataEntities;
    ids: string[];
    excludeRules: string[][];
    includeRules: string[][];
    includeSharingSettings: boolean;
    removeOrgUnitReferences: boolean;
}

export interface NestedRules {
    [metadataType: string]: string[][];
}

export interface SynchronizationState {
    message?: string;
    syncReport?: SynchronizationReport;
    done?: boolean;
}
