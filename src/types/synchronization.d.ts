import { D2ModelSchemas, Ref } from "d2-api";
import SyncReport from "../models/syncReport";
import { DataImportParams, ImportStatus, MetadataImportParams, MetadataImportStats } from "./d2";

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

export interface DataSynchronizationParams extends DataImportParams {
    attributeCategoryOptions?: string[];
    allAttributeCategoryOptions?: boolean;
    orgUnitPaths?: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
    events?: string[];
    allEvents?: boolean;
    generateNewUid?: boolean;
    enableAggregation?: boolean;
    aggregationType?: DataSyncAggregation;
}

export type SynchronizationParams = MetadataSynchronizationParams | DataSynchronizationParams;

export interface ExportBuilder {
    type: keyof D2ModelSchemas;
    ids: string[];
    excludeRules: string[][];
    includeRules: string[][];
    includeSharingSettings: boolean;
}

export interface MetadataPackage {
    [metadataType: string]: any[];
}

export interface AggregatedPackage {
    dataValues: DataValue[];
}

export interface EventsPackage {
    events: ProgramEvent[];
}

export interface SynchronizationResult {
    status: ImportStatus;
    message?: string;
    instance: {
        id: string;
        name?: string;
        url?: string;
    };
    stats?: MetadataImportStats | DataImportStats;
    report?: {
        typeStats?: MetadataImportStats[];
        messages: any[];
    };
    date: Date;
    type: SyncRuleType;
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

export interface ProgramEvent {
    id: string;
    orgUnit: string;
    orgUnitName?: string;
    program: string;
    href: string;
    programStage: string;
    created: string;
    deleted: boolean;
    lastUpdated: string;
    status: string;
    storedBy: string;
    dueDate: string;
    eventDate: string;
    attributeCategoryOptions?: string;
    attributeOptionCombo?: string;
    dataValues: ProgramEventDataValue[];
}

export interface ProgramEventDataValue {
    lastUpdated: string;
    storedBy: string;
    created: string;
    dataElement: string;
    value: any;
    providedElsewhere: boolean;
}

export interface DataValue {
    dataElement: string;
    period: string;
    orgUnit: string;
    categoryOptionCombo: string;
    attributeOptionCombo?: string;
    value: string;
    storedBy: string;
    created: string;
    lastUpdated: string;
    followUp: boolean;
    comment?: string;
}

export type DataSyncPeriod =
    | "ALL"
    | "FIXED"
    | "TODAY"
    | "YESTERDAY"
    | "LAST_7_DAYS"
    | "LAST_14_DAYS"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "THIS_QUARTER"
    | "LAST_QUARTER"
    | "THIS_YEAR"
    | "LAST_YEAR";

export type DataSyncAggregation = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface CategoryOptionAggregationBuilder {
    dataElement: string;
    categoryOptions: string[];
    mappedOptionCombo: string;
    category: string;
}
