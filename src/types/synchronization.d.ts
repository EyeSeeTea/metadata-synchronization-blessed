import Instance from "../models/instance";

export interface SynchronizationBuilder {
    targetInstances: Instance[];
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

export interface SynchronizationResult {
    [metadataType: string]: any[];
}

export interface NestedRules {
    [metadataType: string]: string[];
}
