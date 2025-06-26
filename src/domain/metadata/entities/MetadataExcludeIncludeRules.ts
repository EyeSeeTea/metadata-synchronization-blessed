export interface ExcludeIncludeRules {
    excludeRules: string[];
    includeRules: string[];
    includeOnlyReferencesRules: string[];
    includeReferencesAndObjectsRules: string[];
}

export interface MetadataIncludeExcludeRules {
    [metadataType: string]: ExcludeIncludeRules;
}

export interface NestedRules {
    [metadataType: string]: string[][];
}
