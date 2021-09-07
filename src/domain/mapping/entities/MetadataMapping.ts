export interface MetadataMapping {
    mappedId?: string;
    mappedName?: string;
    mappedCode?: string;
    mappedLevel?: number;
    mappedValue?: string;
    code?: string;
    mapping?: MetadataMappingDictionary;
    overlaps?: MetadataOverlap;
    conflicts?: boolean;
    global?: boolean;
    [key: string]: unknown;
}

export interface MetadataMappingDictionary {
    [model: string]: {
        [id: string]: MetadataMapping;
    };
}

// Dictionary by destination data element uid
export interface MetadataOverlap {
    [id: string]: { type: "replace"; replacer: string };
}
