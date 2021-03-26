import { GetSchemaType, Schema } from "../../../utils/codec";

export const ExcludeIncludeRulesModel = Schema.object({
    excludeRules: Schema.optionalSafe(Schema.array(Schema.string), []),
    includeRules: Schema.optionalSafe(Schema.array(Schema.string), []),
});

export const MetadataIncludeExcludeRulesModel = Schema.dictionary(
    Schema.string,
    ExcludeIncludeRulesModel
);

export type ExcludeIncludeRules = GetSchemaType<typeof ExcludeIncludeRulesModel>;
export type MetadataIncludeExcludeRules = GetSchemaType<typeof MetadataIncludeExcludeRulesModel>;

export interface NestedRules {
    [metadataType: string]: string[][];
}
