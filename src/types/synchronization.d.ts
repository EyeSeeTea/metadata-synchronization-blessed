import { Ref } from "d2-api";

import {
    MetadataImportResponse,
    MetadataImportStats,
    MetadataImportParams,
    DataImportParams,
    DataImportResponse,
    MetadataImportStatus,
    DataImportStatus,
} from "./d2";
import SyncReport from "../models/syncReport";

export interface SynchronizationBuilder {
    targetInstances: string[];
    metadataIds: string[];
    syncRule?: string;
    syncParams?: SynchronizationParams;
    dataParams?: DataSynchronizationParams;
}

export interface SynchronizationParams extends MetadataImportParams {
    includeSharingSettings?: boolean;
}

export interface DataSynchronizationParams extends DataImportParams {
    orgUnitPaths?: string[];
    startDate?: Date;
    endDate?: Date;
    events?: string[];
    allEvents?: boolean;
}

export interface ExportBuilder {
    type: string;
    ids: string[];
    excludeRules: string[][];
    includeRules: string[][];
    includeSharingSettings: boolean;
}

export interface MetadataPackage {
    [metadataType: string]: any[];
}

export interface SynchronizationResult {
    status: MetadataImportStatus | DataImportStatus;
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
}

export type SynchronizationReportStatus = "READY" | "RUNNING" | "FAILURE" | "DONE";

export interface SynchronizationReport {
    id?: string;
    date?: Date;
    user: string;
    status: SynchronizationReportStatus;
    types: string[];
    syncRule?: string;
    type: SyncRuleType;
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
    id?: string;
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

export type SyncRuleType = "metadata" | "aggregated" | "events";

export interface SharingSetting {
    access: string;
    displayName: string;
    id: string;
    name: string;
}

export interface ProgramEvent {
    id: string;
    orgUnit: string;
    orgUnitName: string;
    program: string;
    created: string;
    lastUpdated: string;
    status: string;
    storedBy: string;
    dueDate: string;
    eventDate: string;
}
