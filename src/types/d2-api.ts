import { getMockApiFromClass } from "@eyeseetea/d2-api";
import { D2Api, D2ApiDefinition, models as d2Models } from "@eyeseetea/d2-api/2.40";
import { GetOptionValue } from "@eyeseetea/d2-api/api/common";
import { D2ModelSchemaBase } from "@eyeseetea/d2-api/api/inference";

export { D2Api } from "@eyeseetea/d2-api/2.40";

export {
    D2ApiResponse,
    Analytics,
    CurrentUser,
    DataStore,
    DataValues,
    Metadata,
    Model,
    models,
} from "@eyeseetea/d2-api/2.40";

export type {
    D2ApiDefinition,
    D2CategoryOptionSchema,
    D2CategoryOptionComboSchema,
    D2ConstantSchema,
    D2DataSetSchema,
    D2IndicatorSchema,
    D2ProgramIndicatorSchema,
    D2ProgramSchema,
    MetadataResponse,
    Pager,
    Stats,
    DataValueSetsPostResponse,
    SelectedPick,
    DataStoreKeyMetadata,
    D2Model,
    Id,
    Ref,
    GetOptions,
    MetadataPick,
    D2User,
} from "@eyeseetea/d2-api/2.40";

export type { FilterValueOperator, FilterBase, FilterValue } from "@eyeseetea/d2-api/api/common";
export type { D2SchemaProperties } from "@eyeseetea/d2-api/schemas";
export type { TrackerPostParams, TrackerPostRequest, TrackerPostResponse } from "@eyeseetea/d2-api/api/tracker";
export type {
    D2TrackerTrackedEntity,
    D2TrackerTrackedEntitySchema,
    TrackedEntitiesGetResponse,
} from "@eyeseetea/d2-api/api/trackerTrackedEntities";
export type { D2TrackerEvent, TrackerEventsResponse } from "@eyeseetea/d2-api/api/trackerEvents";

export const D2ApiDefault = D2Api;
export const getMockApi = getMockApiFromClass(D2Api);

// Baseline version for the transformations engine (transformations with
// apiVersion <= API_VERSION are considered baked into the canonical shape).
// This is independent of the d2-api subpath used for type definitions above.
export const API_VERSION = 36;

export type ModelKey = keyof D2Api["models"];

/**
 * Index `api.models` by a runtime string key (e.g. `keyof MetadataEntities`),
 * isolating the unsafe cast in a single place.
 */
export function getApiModel(api: D2Api, key: string) {
    return api.models[key as ModelKey];
}

/**
 * Look up a schema in the static `models` record by a runtime string key.
 * Returns undefined if the key is not a known d2-api model.
 */
export function getModelSchema(key: string) {
    return d2Models[key as keyof typeof d2Models];
}

export type FieldsOf<ModelSchema extends D2ModelSchemaBase> = GetOptionValue<D2ApiDefinition, ModelSchema>["fields"];

export { CancelableResponse, isCancel } from "@eyeseetea/d2-api";
