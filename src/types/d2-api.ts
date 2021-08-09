import { D2ApiDefinition } from "@eyeseetea/d2-api/2.30";
import { GetOptionValue } from "@eyeseetea/d2-api/api/common";
import { D2ModelSchemaBase } from "@eyeseetea/d2-api/api/inference";

export * from "@eyeseetea/d2-api/2.30";

export const API_VERSION = 30;

export type FieldsOf<ModelSchema extends D2ModelSchemaBase> = GetOptionValue<D2ApiDefinition, ModelSchema>["fields"];
