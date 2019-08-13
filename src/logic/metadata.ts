import _ from "lodash";
import axios from "axios";

import { D2, ModelCollection, Params } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { getMetadata } from "../utils/synchronization";
import { d2BaseModelDetails, getBaseUrl } from "../utils/d2";

export async function listByIds(
    d2: D2,
    filters: TableFilters,
    pagination: TablePagination,
    ids: string[]
): Promise<TableList> {
    const { page = 1, pageSize = 20, sorting = ["id", "asc"] } = pagination || {};
    const { metadataType, fields, search = null } = filters;
    const [field, direction] = sorting;

    const metadata = await getMetadata(
        getBaseUrl(d2),
        ids,
        fields ? fields.join(",") : d2BaseModelDetails.map(e => e.name).join(",")
    );

    const objects = _(metadata)
        .mapValues((obj, key) => obj.map((el: any) => ({ ...el, metadataType: key })))
        .values()
        .flatten()
        .filter((el: any) =>
            metadataType ? d2.models[el.metadataType].name === metadataType : true
        )
        .value();

    const filteredData = _.filter(objects, (o: any) =>
        _(o)
            .keys()
            .some(k => o[k].toLowerCase().includes(search ? search.toLowerCase() : ""))
    );

    const sortedData = _.orderBy(
        filteredData,
        [(data: any) => (data[field] ? data[field].toLowerCase() : "")],
        [direction as "asc" | "desc"]
    );

    const currentlyShown = (page - 1) * pageSize;
    const total = sortedData.length;
    const paginatedData = _.slice(sortedData, currentlyShown, currentlyShown + pageSize);

    return { objects: paginatedData, pager: { page, total } };
}

export async function getDeletedObjects(
    d2: D2,
    originalParams?: Params
): Promise<Pick<ModelCollection, "toArray" | "pager">> {
    const { deletedObjects, pager } = (await axios.get(getBaseUrl(d2) + "/deletedObjects", {
        withCredentials: true,
        params: {
            fields: ":all",
            ...originalParams,
            paging: false, // DHIS2 deletedObjects endpoint pager does not work properly
        },
    })).data;

    return { toArray: () => deletedObjects, pager };
}
