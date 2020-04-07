import { D2Api, D2ApiResponse, D2ModelSchemas, Model, PaginatedObjects } from "d2-api";
import { TablePagination, TableSorting } from "d2-ui-components";
import memoize from "nano-memoize";
import { d2ModelFactory } from "../../models/dhis/factory";
import { MetadataType } from "../../utils/d2";

/**
 * Load memoized filter data from an instance (This should be removed with a cache on d2-api)
 * Note: _baseUrl is used as cacheKey to avoid memoizing values between instances
 */
export const getFilterData = memoize(
    (modelName: keyof D2ModelSchemas, type: "group" | "level", _baseUrl: string, api: D2Api) =>
        d2ModelFactory(api, modelName)
            .getApiModel(api)
            .get({
                paging: false,
                fields:
                    type === "group"
                        ? {
                              id: true as true,
                              name: true as true,
                          }
                        : {
                              name: true as true,
                              level: true as true,
                          },
                order: type === "group" ? undefined : `level:iasc`,
            })
            .getData(),
    { maxArgs: 3 }
);

/**
 * Load memoized ids to enable selection in all pages (This should be removed with a cache on d2-api)
 * Note: _modelName and _baseUrl are used as cacheKey to avoid memoizing values between models and instances
 */
export const getAllIdentifiers = memoize(
    (
        _modelName: string,
        _baseUrl: string,
        search: string | undefined,
        apiQuery: Parameters<InstanceType<typeof Model>["get"]>[0],
        apiModel: InstanceType<typeof Model>
    ) => {
        return apiModel.get({
            ...apiQuery,
            paging: false,
            fields: {
                id: true as true,
            },
            filter: {
                name: { ilike: search },
                ...apiQuery.filter,
            },
        });
    },
    { maxArgs: 4 }
);

/**
 * Load memoized rows to display in metadata table (This should be removed with a cache on d2-api)
 * Note: _modelName and _baseUrl are used as cachceKey to avoid memoizing values between models and instances
 */
export const getRows = memoize(
    (
        _modelName: string,
        _baseUrl: string,
        sorting: TableSorting<MetadataType>,
        pagination: Partial<TablePagination>,
        search: string | undefined,
        apiQuery: Parameters<InstanceType<typeof Model>["get"]>[0],
        apiModel: InstanceType<typeof Model>
    ): D2ApiResponse<PaginatedObjects<MetadataType>> => {
        return apiModel.get({
            order: `${sorting.field}:i${sorting.order}`,
            page: pagination.page,
            pageSize: pagination.pageSize,
            ...apiQuery,
            paging: undefined,
            filter: {
                name: { token: search },
                ...apiQuery.filter,
            },
        });
    },
    { maxArgs: 6 }
);

export async function getOrgUnitSubtree(api: D2Api, orgUnitId: string): Promise<string[]> {
    const { organisationUnits } = (await api
        .get(`/organisationUnits/${orgUnitId}`, { fields: "id", includeDescendants: true })
        .getData()) as { organisationUnits: { id: string }[] };

    return organisationUnits.map(({ id }) => id);
}
