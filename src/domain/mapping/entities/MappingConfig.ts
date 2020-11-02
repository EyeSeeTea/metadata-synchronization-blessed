import { MetadataMapping } from "../../instance/entities/MetadataMapping";

export interface MappingConfig {
    mappingType: string;
    global?: boolean;
    selection: string[];
    mappedId: string | undefined;
    overrides?: MetadataMapping;
}
