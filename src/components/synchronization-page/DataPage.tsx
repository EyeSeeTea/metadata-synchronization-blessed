import React, { useState, useEffect } from "react";
import { useD2ApiData } from "../../next/useApiData";
import { useD2Api } from "../../next/context";
import { SelectedPick, D2DataSetSchema, D2DataSet } from "d2-api";
import { ObjectsTable, TableState, TableSorting, TablePagination } from "d2-ui-components";
import i18n from "@dhis2/d2-i18n";

const include = true as true;

const dataSetFieldsForList = {
    id: include,
    displayName: include,
    lastUpdated: include,
};

export type DataSetForList = SelectedPick<D2DataSetSchema, typeof dataSetFieldsForList>;

const DataPage: React.FC<any> = () => {
    const api = useD2Api();
    const [search, updateSearch] = useState<string | undefined>(undefined);
    const [sorting, updateSorting] = useState<TableSorting<D2DataSet>>({
        field: "displayName",
        order: "asc" as const,
    });
    // TODO: As originally discussed with @tokland we should move this optional to the type definition file
    const [pagination, updatePagination] = useState<Omit<TablePagination, "total">>({
        page: 1,
        pageSize: 10,
    });

    const initialRequest = {
        paging: true,
        fields: dataSetFieldsForList,
        order: `${sorting.field}:i${sorting.order}`,
        page: pagination.page,
        pageSize: pagination.pageSize,
    } as const;

    const { loading, data, error, refetch } = useD2ApiData(api.models.dataSets.get(initialRequest));

    useEffect(
        () =>
            refetch(
                api.models.dataSets.get({
                    ...initialRequest,
                    filter: {
                        name: { ilike: search },
                    },
                })
            ),
        [search, sorting, pagination]
    );

    if (loading) return <p>{"Loading..."}</p>;
    if (error) return <p>{"Error: " + JSON.stringify(error)}</p>;

    //@ts-ignore @tokland Could you take a look into the TS error here?
    const { objects, pager } = data;

    const columns = [
        { name: "displayName" as const, text: i18n.t("Name"), sortable: true },
        { name: "lastUpdated" as const, text: i18n.t("Last update"), sortable: true },
        { name: "id" as const, text: i18n.t("UID"), sortable: true },
    ];

    const handleSearchChange = (search: string) => {
        updateSearch(search);
    };

    const handleTableChange = (tableState: TableState<D2DataSet>) => {
        const { sorting, pagination } = tableState;
        updateSorting(sorting);
        updatePagination(pagination);
    };

    console.log("Rendering", objects, pager);

    return (
        <ObjectsTable<D2DataSet>
            rows={objects}
            columns={columns}
            onChangeSearch={handleSearchChange}
            searchBoxLabel={i18n.t("Search by name")}
            searchBoxColumns={["displayName"]} // @tokland I would remove this from mandatory prop to show the search box and use a union of onChangeSearch and searchBoxColumns
            pagination={pager}
            onChange={handleTableChange}
        />
    );
};

export default DataPage;
