import i18n from "@dhis2/d2-i18n";
import D2ApiModel from "d2-api/api/models";
import {
    ObjectsTable,
    ObjectsTableProps,
    ReferenceObject,
    TableObject,
    TableState,
} from "d2-ui-components";
import _ from "lodash";
import memoize from "nano-memoize";
import React, { useEffect, useState } from "react";
import { useD2ApiData } from "d2-api";

export interface D2ObjectsTableProps<T extends ReferenceObject>
    extends Omit<ObjectsTableProps<T>, "rows"> {
    apiModel: InstanceType<typeof D2ApiModel>;
    apiQuery?: Parameters<InstanceType<typeof D2ApiModel>["get"]>[0];
    transformObjects?(objects: T[]): T[];
}

const defaultState = {
    sorting: {
        field: "id" as const,
        order: "asc" as const,
    },
    pagination: {
        page: 1,
        pageSize: 25,
    },
};

const getAllIdentifiers = memoize(
    async (
        _cacheKey: string,
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
            })
            .getData();
        return _.map(objects, "id");
    },
    { maxArgs: 1 }
);

export function D2ObjectsTable<T extends ReferenceObject = TableObject>(
    props: D2ObjectsTableProps<T>
) {
    const {
        apiModel,
        apiQuery = { fields: {} },
        transformObjects = (objects: T[]) => objects,
        initialState = defaultState,
        onChange = _.noop,
        ...rest
    } = props;
    const [ids, updateIds] = useState<string[]>([]);
    const [search, updateSearch] = useState<string | undefined>(undefined);
    const [sorting, updateSorting] = useState(initialState.sorting || defaultState.sorting);
    const [pagination, updatePagination] = useState(
        initialState.pagination || defaultState.pagination
    );

    const { loading, data, error, refetch } = useD2ApiData();

    useEffect(() => {
        getAllIdentifiers(apiModel.modelName, apiModel, apiQuery).then(updateIds);
    }, [apiModel, apiQuery]);

    useEffect(
        () =>
            refetch(
                apiModel.get({
                    order: `${sorting.field}:i${sorting.order}`,
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                    ...apiQuery,
                    filter: {
                        name: { ilike: search },
                        ...apiQuery.filter,
                    },
                })
            ),
        [apiModel, apiQuery, refetch, sorting, pagination, search]
    );

    if (error) return <p>{"Error: " + JSON.stringify(error)}</p>;

    // @ts-ignore @tokland How do we handle non-paginated inference here?
    const { objects, pager } = data || { objects: [], pager: undefined };

    const handleTableChange = (tableState: TableState<T>) => {
        const { sorting, pagination } = tableState;
        updateSorting(sorting);
        updatePagination(pagination);
        onChange(tableState);
    };

    return (
        <ObjectsTable<T>
            rows={transformObjects(objects)}
            onChangeSearch={updateSearch}
            initialState={initialState}
            searchBoxLabel={i18n.t("Search by name")}
            pagination={pager}
            onChange={handleTableChange}
            ids={ids}
            loading={loading}
            {...rest}
        />
    );
}

export default D2ObjectsTable;
