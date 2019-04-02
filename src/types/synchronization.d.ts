import { MetadataImportResponse } from "./d2";

export interface SynchronizationBuilder {
    targetInstances: string[];
    metadata: {
        [metadataType: string]: string[];
    };
}

export interface ExportBuilder {
    type: string;
    ids: string[];
    excludeRules: string[];
    includeRules: string[];
}

export interface MetadataPackage {
    [metadataType: string]: any[];
}

export interface SynchronizationResult extends MetadataImportResponse {
    httpStatus: number;
    instance: {
        id: string;
        name: string;
        url: string;
    };
}

export interface NestedRules {
    [metadataType: string]: string[];
}
