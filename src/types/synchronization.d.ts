import { MetadataImportResponse, MetadataImportStats } from "./d2";

export interface SynchronizationBuilder {
    targetInstances: string[];
    metadata: {
        [metadataType: string]: string[];
    };
}

export interface ExportBuilder {
    type: string;
    ids: string[];
    excludeRules: string[][];
    includeRules: string[][];
}

export interface MetadataPackage {
    [metadataType: string]: any[];
}

export interface SynchronizationResult extends MetadataImportResponse {
    instance: {
        id: string;
        name?: string;
        url?: string;
    };
    report?: {
        typeStats: MetadataImportStats[];
        messages: any[];
    };
}

export type SynchronizationReportStatus = "READY" | "RUNNING" | "FAILURE" | "DONE";

export interface SynchronizationReport {
    id?: string;
    timestamp?: Date;
    user: string;
    status: SynchronizationReportStatus;
    results: SynchronizationResult[];
    metadata: MetadataPackage;
}

export interface NestedRules {
    [metadataType: string]: string[][];
}
