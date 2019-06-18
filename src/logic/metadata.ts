import _ from "lodash";

import { D2 } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { getMetadata } from "../utils/synchronization";
import { d2BaseModelDetails } from "../utils/d2";

export async function listByIds(
    d2: D2,
    filters: TableFilters,
    pagination: TablePagination,
    ids: string[]
): Promise<TableList> {
    const { page = 1, pageSize = 20, sorting = ["id", "asc"] } = pagination || {};
    const [field, direction] = sorting;

    const metadata = await getMetadata(
        d2,
        ids,
        filters.fields ? filters.fields.join(",") : d2BaseModelDetails.map(e => e.name).join(",")
    );

    if (metadata.system) delete metadata.system;
    const objects = _(metadata)
        .mapValues((obj, key) => obj.map((el: any) => ({ ...el, metadataType: key })))
        .values()
        .flatten()
        .value();

    const { search = null } = filters || {};
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
    const pageCount = Math.ceil(sortedData.length / pageSize);
    const total = sortedData.length;
    const paginatedData = _.slice(sortedData, currentlyShown, currentlyShown + pageSize);

    return { objects: paginatedData, pager: { page, pageCount, total } };
}
