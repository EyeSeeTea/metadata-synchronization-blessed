import { getMockApiFromClass } from "@eyeseetea/d2-api";
import { D2Api, D2ApiDefinition } from "@eyeseetea/d2-api/2.36";
import { GetOptionValue } from "@eyeseetea/d2-api/api/common";
import { D2ModelSchemaBase } from "@eyeseetea/d2-api/api/inference";

export * from "@eyeseetea/d2-api/2.36";

export const D2ApiDefault = D2Api;
export const getMockApi = getMockApiFromClass(D2Api);

export const API_VERSION = 36;

export type FieldsOf<ModelSchema extends D2ModelSchemaBase> = GetOptionValue<D2ApiDefinition, ModelSchema>["fields"];

export { CancelableResponse } from "@eyeseetea/d2-api";
