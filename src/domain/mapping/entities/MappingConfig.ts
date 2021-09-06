import { MetadataMapping } from "./MetadataMapping";

export interface MappingConfig {
    mappingType: string;
    global?: boolean;
    selection: string[];
    mappedId: string | undefined;
    mappedValue?: string;
    overrides?: MetadataMapping;
}
