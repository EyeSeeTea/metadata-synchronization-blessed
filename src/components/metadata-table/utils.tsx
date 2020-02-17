import { D2Api, D2ModelSchemas } from "d2-api";
import D2ApiModel from "d2-api/api/models";
import { TablePagination, TableSorting } from "d2-ui-components";
import _ from "lodash";
import memoize from "nano-memoize";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import { MetadataType } from "../../utils/d2";

/**
 * Load memoized filter data from an instance
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
 * Load memoized ids to enable selection in all pages
 * Note: _modelName and _baseUrl are used as cacheKey to avoid memoizing values between models and instances
 */
export const getAllIdentifiers = memoize(
    (
        _modelName: string,
        _baseUrl: string,
        search: string | undefined,
        apiQuery: Parameters<InstanceType<typeof D2ApiModel>["get"]>[0],
        apiModel: InstanceType<typeof D2ApiModel>
    ) => {
        return apiModel.get({
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
    { maxArgs: 4, equals: _.isEqual }
);

export const getRows = memoize(
    (
        _modelName: string,
        _baseUrl: string,
        sorting: TableSorting<MetadataType>,
        pagination: Partial<TablePagination>,
        search: string | undefined,
        apiQuery: Parameters<InstanceType<typeof D2ApiModel>["get"]>[0],
        apiModel: InstanceType<typeof D2ApiModel>
    ) => {
        return apiModel.get({
            order: `${sorting.field}:i${sorting.order}`,
            page: pagination.page,
            pageSize: pagination.pageSize,
            ...apiQuery,
            filter: {
                name: { ilike: search },
                ...apiQuery.filter,
            },
        });
    },
    { maxArgs: 6, equals: _.isEqual }
);
