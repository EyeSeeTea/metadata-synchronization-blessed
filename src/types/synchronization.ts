import { DataSynchronizationParams } from "../domain/aggregated/types";
import { MetadataEntities } from "../domain/metadata/entities/MetadataEntities";
import SyncReport from "../models/syncReport";
import { MetadataImportParams } from "./d2";
import { FilterRule } from "../domain/metadata/entities/FilterRule";

//TODO: Review this to move it to domain

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
    syncReport?: SyncReport;
    done?: boolean;
}
