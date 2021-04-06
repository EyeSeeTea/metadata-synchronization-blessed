import { Codec, Schema } from "../../../utils/codec";
import {
    MetadataIncludeExcludeRules,
    MetadataIncludeExcludeRulesModel,
} from "./MetadataExcludeIncludeRules";

export const MetadataImportParamsModel: Codec<MetadataImportParams> = Schema.object({
    atomicMode: Schema.optional(Schema.oneOf([Schema.exact("ALL"), Schema.exact("NONE")])),
    flushMode: Schema.optional(Schema.oneOf([Schema.exact("AUTO"), Schema.exact("OBJECT")])),
    identifier: Schema.optional(
        Schema.oneOf([Schema.exact("UID"), Schema.exact("CODE"), Schema.exact("AUTO")])
    ),
    importMode: Schema.optional(Schema.oneOf([Schema.exact("COMMIT"), Schema.exact("VALIDATE")])),
    importStrategy: Schema.optional(
        Schema.oneOf([
            Schema.exact("CREATE_AND_UPDATE"),
            Schema.exact("CREATE"),
            Schema.exact("UPDATE"),
            Schema.exact("DELETE"),
        ])
    ),
    importReportMode: Schema.optional(
        Schema.oneOf([Schema.exact("ERRORS"), Schema.exact("FULL"), Schema.exact("DEBUG")])
    ),
    mergeMode: Schema.optional(Schema.oneOf([Schema.exact("MERGE"), Schema.exact("REPLACE")])),
    preheatMode: Schema.optional(
        Schema.oneOf([Schema.exact("REFERENCE"), Schema.exact("ALL"), Schema.exact("NONE")])
    ),
    userOverrideMode: Schema.optional(
        Schema.oneOf([Schema.exact("NONE"), Schema.exact("CURRENT"), Schema.exact("SELECTED")])
    ),
    skipSharing: Schema.optional(Schema.boolean),
    skipValidation: Schema.optional(Schema.boolean),
    username: Schema.optional(Schema.string),
});

export interface MetadataImportParams {
    atomicMode?: "ALL" | "NONE";
    flushMode?: "AUTO" | "OBJECT";
    identifier?: "UID" | "CODE" | "AUTO";
    importMode?: "COMMIT" | "VALIDATE";
    importStrategy?: "CREATE_AND_UPDATE" | "CREATE" | "UPDATE" | "DELETE";
    importReportMode?: "ERRORS" | "FULL" | "DEBUG";
    mergeMode?: "MERGE" | "REPLACE";
    preheatMode?: "REFERENCE" | "ALL" | "NONE";
    skipSharing?: boolean;
    skipValidation?: boolean;
    userOverrideMode?: "NONE" | "CURRENT" | "SELECTED";
    username?: string;
}

export const MetadataSynchronizationParamsModel: Codec<MetadataSynchronizationParams> = Schema.extend(
    MetadataImportParamsModel,
    Schema.object({
        enableMapping: Schema.boolean,
        includeSharingSettings: Schema.boolean,
        removeOrgUnitReferences: Schema.boolean,
        useDefaultIncludeExclude: Schema.boolean,
        metadataIncludeExcludeRules: Schema.optional(MetadataIncludeExcludeRulesModel),
    })
);

export interface MetadataSynchronizationParams extends MetadataImportParams {
    enableMapping: boolean;
    includeSharingSettings: boolean;
    removeOrgUnitReferences: boolean;
    useDefaultIncludeExclude: boolean;
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}
