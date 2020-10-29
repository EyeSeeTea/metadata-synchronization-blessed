import { MetadataMapping } from "../../instance/entities/MetadataMapping";

export interface MappingConfig {
    selection: string[];
    mappedId: string | undefined;
    overrides?: MetadataMapping;
}
