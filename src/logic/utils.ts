import _ from "lodash";
import axios from "axios";

import { D2, ModelCollection, Params } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { getMetadata } from "../utils/synchronization";
import { d2BaseModelDetails, organisationUnitsDetails, getBaseUrl } from "../utils/d2";

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
        fields
            ? fields.join(",")
            : [...d2BaseModelDetails, ...organisationUnitsDetails].map(e => e.name).join(",")
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
            .some(k =>
                String(o[k])
                    .toLowerCase()
                    .includes(search ? search.toLowerCase() : "")
            )
    );

    const sortedData = _.orderBy(
        filteredData,
        [(data: any) => (data[field] ? String(data[field]).toLowerCase() : "")],
        [direction as "asc" | "desc"]
    );

    const currentlyShown = (page - 1) * pageSize;
    const total = sortedData.length;
    const paginatedData = _.slice(sortedData, currentlyShown, currentlyShown + pageSize);

    return {
        objects: paginatedData,
        pager: { page, total, pageCount: Math.ceil(total / pageSize) },
    };
}

export async function getDeletedObjects(
    d2: D2,
    originalParams?: Params
): Promise<Pick<ModelCollection, "toArray" | "pager">> {
    const { deletedObjects, pager } = (
        await axios.get(getBaseUrl(d2) + "/deletedObjects", {
            withCredentials: true,
            params: {
                fields: ":all",
                ...originalParams,
                paging: false, // DHIS2 deletedObjects endpoint pager does not work properly
            },
        })
    ).data;

    return { toArray: () => deletedObjects, pager };
}

// BEWARE: This is a very dangerous operation (includeDescendants in old DHIS2 versions crashed the whole server)
export async function getOrgUnitSubtree(d2: D2, orgUnitId: string): Promise<string[]> {
    const { organisationUnits } = (
        await axios.get(getBaseUrl(d2) + "/organisationUnits/" + orgUnitId, {
            withCredentials: true,
            params: {
                fields: "id",
                includeDescendants: true,
            },
        })
    ).data as { organisationUnits: { id: string }[] };

    return organisationUnits.map(ou => ou.id);
}
