export interface MetadataMapping {
    mappedId?: string;
    mappedName?: string;
    mappedCode?: string;
    mappedLevel?: number;
    code?: string;
    mapping?: MetadataMappingDictionary;
    conflicts?: boolean;
    global?: boolean;
    [key: string]: unknown;
}

export interface MetadataMappingDictionary {
    [model: string]: {
        [id: string]: MetadataMapping;
    };
}
