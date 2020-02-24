import { D2Api, D2ModelSchemas, Model } from "d2-api";
import _ from "lodash";
import memoize from "nano-memoize";
import { d2ModelFactory } from "../../models/d2ModelFactory";

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
    async (
        search: string | undefined,
        _modelName: string,
        _baseUrl: string,
        apiModel: InstanceType<typeof Model>,
        apiQuery: Parameters<InstanceType<typeof Model>["get"]>[0]
    ) => {
        const { objects } = await apiModel
            .get({
                ...apiQuery,
                paging: false,
                fields: {
                    id: true as true,
                },
                filter: {
                    name: { ilike: search },
                    ...apiQuery.filter,
                },
            })
            .getData();
        return _.map(objects, "id");
    },
    { maxArgs: 3 }
);
