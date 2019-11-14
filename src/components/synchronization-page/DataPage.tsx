import React from "react";
import { useD2ApiData } from "../../next/useApiData";
import { useD2Api } from "../../next/context";
import { SelectedPick, D2DataSetSchema, D2DataSet } from "d2-api";
import { ObjectsTable } from "d2-ui-components";
import i18n from "@dhis2/d2-i18n";

const include = true as true;

const dataSetFieldsForList = {
    id: include,
    displayName: include,
    lastUpdated: include,
};

export type DataSetForList = SelectedPick<D2DataSetSchema, typeof dataSetFieldsForList>;

const apiRequest = {
    paging: false,
    fields: dataSetFieldsForList,
} as const;

const DataPage: React.FC<any> = () => {
    const api = useD2Api();
    const request = api.models.dataSets.get(apiRequest);
    const { loading, data, error } = useD2ApiData(request);

    if (loading) return <p>{"Loading..."}</p>;
    if (error) return <p>{"Error: " + JSON.stringify(error)}</p>;

    //@ts-ignore @tokland Could you take a look into the TS error here?
    const { objects, pager } = data;

    const columns = [
        { name: "displayName" as const, text: i18n.t("Name"), sortable: true },
        { name: "lastUpdated" as const, text: i18n.t("Last update"), sortable: true },
        { name: "id" as const, text: i18n.t("UID"), sortable: true },
    ];

    console.log("Rendering", objects, pager);

    return <ObjectsTable<D2DataSet> rows={objects} columns={columns} />;
};

export default DataPage;
