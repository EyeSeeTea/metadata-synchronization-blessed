import { Codec, Schema } from "../../../utils/codec";

export const ExcludeIncludeRulesModel: Codec<ExcludeIncludeRules> = Schema.object({
    excludeRules: Schema.optionalSafe(Schema.array(Schema.string), []),
    includeRules: Schema.optionalSafe(Schema.array(Schema.string), []),
});

export interface ExcludeIncludeRules {
    excludeRules: string[];
    includeRules: string[];
}

export const MetadataIncludeExcludeRulesModel: Codec<MetadataIncludeExcludeRules> = Schema.dictionary(
    Schema.string,
    ExcludeIncludeRulesModel
);

export interface MetadataIncludeExcludeRules {
    [metadataType: string]: ExcludeIncludeRules;
}

export interface NestedRules {
    [metadataType: string]: string[][];
}
