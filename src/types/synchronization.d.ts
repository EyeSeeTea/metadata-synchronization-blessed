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
        name: string;
        url: string;
    };
    report: {
        typeStats: MetadataImportStats[];
        messages: any[];
    };
}

export interface SynchronizationResults {
    results: SynchronizationResult[];
    timestamp: Date;
    user: string;
    status: "READY" | "RUNNING" | "FAILURE" | "DONE";
    metadata: MetadataPackage;
}

export interface NestedRules {
    [metadataType: string]: string[][];
}
