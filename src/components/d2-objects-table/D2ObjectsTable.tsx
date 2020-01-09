import i18n from "@dhis2/d2-i18n";
import { useD2ApiData } from "d2-api";
import D2ApiModel from "d2-api/api/models";
import {
    ObjectsTable,
    ObjectsTableProps,
    ReferenceObject,
    TableObject,
    TableSelection,
    TableState,
} from "d2-ui-components";
import _ from "lodash";
import memoize from "nano-memoize";
import React, { useEffect, useState } from "react";

export interface D2ObjectsTableProps<T extends ReferenceObject>
    extends Omit<ObjectsTableProps<T>, "rows"> {
    apiModel: InstanceType<typeof D2ApiModel>;
    apiQuery?: Parameters<InstanceType<typeof D2ApiModel>["get"]>[0];
    transformObjects?(objects: T[]): T[];
    exclusion?: TableSelection[];
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

export function D2ObjectsTable<T extends ReferenceObject = TableObject>({
    apiModel,
    apiQuery = { fields: {} },
    transformObjects = (objects: T[]) => objects,
    initialState = defaultState,
    onChange = _.noop,
    selection = [],
    exclusion = [],
    childrenKeys = [],
    ...rest
}: D2ObjectsTableProps<T>) {
    const [ids, updateIds] = useState<string[]>([]);
    const [search, updateSearch] = useState<string | undefined>(undefined);
    const [sorting, updateSorting] = useState(initialState.sorting || defaultState.sorting);
    const [pagination, updatePagination] = useState(
        initialState.pagination || defaultState.pagination
    );

    const { loading, data, error, refetch } = useD2ApiData<any>();

    useEffect(() => {
        getAllIdentifiers(apiModel.modelName, search, apiModel, apiQuery).then(updateIds);
    }, [apiModel, apiQuery, search]);

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

    const { objects, pager } = data || { objects: [], pager: undefined };

    const handleTableChange = (tableState: TableState<T>) => {
        const { sorting, pagination } = tableState;
        updateSorting(sorting);
        updatePagination(pagination);
        onChange(tableState);
    };

    const rows = transformObjects(objects);
    const childrenSelection: TableSelection[] = _(rows)
        .intersectionBy(selection, "id")
        .map(row => (_.values(_.pick(row, childrenKeys)) as unknown) as T)
        .flattenDeep()
        .differenceBy(selection, "id")
        .differenceBy(exclusion, "id")
        .map(({ id }) => {
            return {
                id,
                checked: true,
                indeterminate: !_.find(selection, { id }),
            } as TableSelection;
        })
        .value();

    return (
        <ObjectsTable<T>
            rows={rows}
            onChangeSearch={updateSearch}
            initialState={initialState}
            searchBoxLabel={i18n.t("Search by name")}
            pagination={pager}
            onChange={handleTableChange}
            ids={ids}
            loading={loading}
            selection={[...selection, ...childrenSelection]}
            childrenKeys={childrenKeys}
            {...rest}
        />
    );
}

export default D2ObjectsTable;
