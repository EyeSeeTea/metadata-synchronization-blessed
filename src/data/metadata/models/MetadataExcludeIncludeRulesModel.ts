import {
    ExcludeIncludeRules,
    MetadataIncludeExcludeRules,
} from "../../../domain/metadata/entities/MetadataExcludeIncludeRules";
import { Codec, Schema } from "../../../utils/codec";

export const ExcludeIncludeRulesModel: Codec<ExcludeIncludeRules> = Schema.object({
    excludeRules: Schema.optionalSafe(Schema.array(Schema.string), []),
    includeRules: Schema.optionalSafe(Schema.array(Schema.string), []),
});

export const MetadataIncludeExcludeRulesModel: Codec<MetadataIncludeExcludeRules> = Schema.dictionary(
    Schema.string,
    ExcludeIncludeRulesModel
);
