import { GetOptionValue } from "d2-api/api/common";
import { D2ApiDefinition } from "d2-api/2.30";
import { D2ModelSchemaBase } from "d2-api/api/inference";

export * from "d2-api/2.30";

export const API_VERSION = 30;

export type FieldsOf<ModelSchema extends D2ModelSchemaBase> = GetOptionValue<
    D2ApiDefinition,
    ModelSchema
>["fields"];
