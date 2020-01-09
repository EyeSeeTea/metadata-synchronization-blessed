import { D2Api } from "d2-api";
import D2ApiModel from "d2-api/api/models";
import memoize from "nano-memoize";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import { D2 } from "../../types/d2";
import _ from "lodash";

export const getFilterData = memoize(
    (modelName: string, type: "group" | "level", d2: D2, api: D2Api) =>
        d2ModelFactory(d2, modelName)
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
    { maxArgs: 2 }
);

export const getAllIdentifiers = memoize(
    async (
        _cacheKey: string,
        search: string | undefined,
        apiModel: InstanceType<typeof D2ApiModel>,
        apiQuery: Parameters<InstanceType<typeof D2ApiModel>["get"]>[0]
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
    { maxArgs: 2 }
);
