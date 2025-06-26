import {
    MetadataImportParams,
    MetadataSynchronizationParams,
} from "../../../domain/metadata/entities/MetadataSynchronizationParams";
import { Codec, Schema } from "../../../utils/codec";
import { MetadataIncludeExcludeRulesModel } from "./MetadataExcludeIncludeRulesModel";

export const MetadataImportParamsModel: Codec<MetadataImportParams> = Schema.object({
    atomicMode: Schema.optional(Schema.oneOf([Schema.exact("ALL"), Schema.exact("NONE")])),
    flushMode: Schema.optional(Schema.oneOf([Schema.exact("AUTO"), Schema.exact("OBJECT")])),
    identifier: Schema.optional(Schema.oneOf([Schema.exact("UID"), Schema.exact("CODE"), Schema.exact("AUTO")])),
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
    preheatMode: Schema.optional(Schema.oneOf([Schema.exact("REFERENCE"), Schema.exact("ALL"), Schema.exact("NONE")])),
    userOverrideMode: Schema.optional(
        Schema.oneOf([Schema.exact("NONE"), Schema.exact("CURRENT"), Schema.exact("SELECTED")])
    ),
    skipSharing: Schema.optional(Schema.boolean),
    skipValidation: Schema.optional(Schema.boolean),
    username: Schema.optional(Schema.string),
});

export const MetadataSynchronizationParamsModel: Codec<MetadataSynchronizationParams> = Schema.extend(
    MetadataImportParamsModel,
    Schema.object({
        enableMapping: Schema.optionalSafe(Schema.boolean, false),
        useDefaultIncludeExclude: Schema.optionalSafe(Schema.boolean, true),
        metadataIncludeExcludeRules: Schema.optional(MetadataIncludeExcludeRulesModel),
        metadataModelsSyncAll: Schema.optionalSafe(Schema.array(Schema.string), []),
        includeSharingSettingsObjectsAndReferences: Schema.optionalSafe(Schema.boolean, true),
        includeOnlySharingSettingsReferences: Schema.optionalSafe(Schema.boolean, false),
        includeUsersObjectsAndReferences: Schema.optionalSafe(Schema.boolean, true),
        includeOnlyUsersReferences: Schema.optionalSafe(Schema.boolean, false),
        includeOrgUnitsObjectsAndReferences: Schema.optionalSafe(Schema.boolean, true),
        includeOnlyOrgUnitsReferences: Schema.optionalSafe(Schema.boolean, false),
        removeDefaultCategoryObjects: Schema.optional(Schema.boolean),
        removeUserNonEssentialObjects: Schema.optional(Schema.boolean),
    })
);
