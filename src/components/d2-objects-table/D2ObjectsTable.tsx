import i18n from "@dhis2/d2-i18n";
import { D2ApiDataHookQuery, NonPaginatedObjects, PaginatedObjects, useD2ApiData } from "d2-api";
import {
    ObjectsTable,
    ObjectsTableProps,
    ReferenceObject,
    TableObject,
    TableState,
} from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";

export interface D2ObjectsTableProps<T extends ReferenceObject>
    extends Omit<ObjectsTableProps<T>, "rows"> {
    apiMethod(options: any): D2ApiDataHookQuery<PaginatedObjects<T> | NonPaginatedObjects<T>>; // TODO inference
    apiQuery?: any; // TODO inference
}

const defaultState = {
    sorting: {
        field: "id" as const,
        order: "asc" as const,
    },
    pagination: {
        page: 1,
        pageSize: 10,
    },
};

export function D2ObjectsTable<T extends ReferenceObject = TableObject>(
    props: D2ObjectsTableProps<T>
) {
    const {
        apiMethod,
        apiQuery = {},
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

    const initialRequest = useMemo(
        () =>
            apiMethod({
                order: `id:iasc`,
                pageSize: 10,
                ...apiQuery,
            }),
        [apiMethod, apiQuery]
    );

    const { loading, data, error, refetch } = useD2ApiData(initialRequest);

    useEffect(() => {
        apiMethod({
            paging: false,
            fields: {
                id: true as true,
            },
        })
            .getData()
            .then(({ objects }) => updateIds(_.map(objects, "id")));
    }, [apiMethod]);

    useEffect(
        () =>
            refetch(
                apiMethod({
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
        [apiMethod, apiQuery, refetch, sorting, pagination, search]
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
            rows={objects}
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
