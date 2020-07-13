import { D2ModelSchemas, Ref } from "../types/d2-api";
import SyncReport from "../models/syncReport";
import { DataImportParams, MetadataImportParams } from "./d2";
import { SynchronizationRule } from "./SynchronizationRule";

//TODO: Review this to move it to domain

export interface SynchronizationBuilder {
    targetInstances: string[];
    metadataIds: string[];
    excludedIds: string[];
    metadataTypes: string[];
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
