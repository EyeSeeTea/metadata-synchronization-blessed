import { D2ModelSchemas, Ref } from "../types/d2-api";
import SyncReport from "../models/syncReport";
import { DataImportParams, MetadataImportParams } from "./d2";

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

export type SynchronizationReportStatus = "READY" | "RUNNING" | "FAILURE" | "DONE";

export interface SynchronizationReport {
    id: string;
    date?: Date;
    user: string;
    status: SynchronizationReportStatus;
    types: string[];
    syncRule?: string;
    deletedSyncRuleLabel?: string;
    type: SyncRuleType;
    dataStats?: AggregatedDataStats[] | EventsDataStats[];
}

export interface AggregatedDataStats {
    dataElement: string;
    count: number;
}

export interface EventsDataStats {
    program: string;
    count: number;
    orgUnits: string[];
}

export interface NestedRules {
    [metadataType: string]: string[][];
}

export interface SynchronizationState {
    message?: string;
    syncReport?: SyncReport;
    done?: boolean;
}

interface NamedRef extends Ref {
    name: string;
}

export interface SynchronizationRule {
    id: string;
    name: string;
    code?: string;
    created: Date;
    description?: string;
    builder: SynchronizationBuilder;
    enabled: boolean;
    lastExecuted?: Date;
    lastUpdated: Date;
    lastUpdatedBy: NamedRef;
    frequency?: string;
    publicAccess: string;
    user: NamedRef;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
    type: SyncRuleType;
}

export type SynchronizationRuleMain = Omit<SynchronizationRule, DetailsKeys>;

export type SyncRuleType = "metadata" | "aggregated" | "events" | "deleted";

export interface SharingSetting {
    access: string;
    displayName: string;
    id: string;
    name: string;
}

export interface CategoryOptionAggregationBuilder {
    dataElement: string;
    categoryOptions: string[];
    mappedOptionCombo: string;
    category: string;
}
