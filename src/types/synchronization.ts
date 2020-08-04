import { DataSynchronizationParams } from "../domain/aggregated/types";
import SyncReport from "../models/syncReport";
import { MetadataImportParams } from "./d2";
import { D2ModelSchemas } from "./d2-api";

//TODO: Review this to move it to domain

export interface SynchronizationBuilder {
    originInstance: string;
    targetInstances: string[];
    metadataIds: string[];
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
    includeSharingSettings: boolean;
    useDefaultIncludeExclude: boolean;
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}

export type SynchronizationParams = MetadataSynchronizationParams | DataSynchronizationParams;

export interface ExportBuilder {
    type: keyof D2ModelSchemas;
    ids: string[];
    excludeRules: string[][];
    includeRules: string[][];
    includeSharingSettings: boolean;
}

export interface NestedRules {
    [metadataType: string]: string[][];
}

export interface SynchronizationState {
    message?: string;
    syncReport?: SyncReport;
    done?: boolean;
}
