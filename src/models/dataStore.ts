import _ from "lodash";
import axios from "axios";

import { D2, Response } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { getBaseUrl } from "../utils/d2";

const dataStoreNamespace = "metadata-synchronization";

export async function getDataStore(d2: D2, dataStoreKey: string, defaultValue: any): Promise<any> {
    const baseUrl = getBaseUrl(d2);

    try {
        const response = await axios.get(
            baseUrl + `/dataStore/${dataStoreNamespace}/${dataStoreKey}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            await axios.post(
                baseUrl + `/dataStore/${dataStoreNamespace}/${dataStoreKey}`,
                defaultValue,
                { withCredentials: true }
            );
            return defaultValue;
        } else {
            throw error;
        }
    }
}

export async function saveDataStore(d2: D2, dataStoreKey: string, value: any): Promise<void> {
    const baseUrl = getBaseUrl(d2);
    try {
        await axios.put(baseUrl + `/dataStore/${dataStoreNamespace}/${dataStoreKey}`, value, {
            withCredentials: true,
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            await axios.post(baseUrl + `/dataStore/${dataStoreNamespace}/${dataStoreKey}`, value, {
                withCredentials: true,
            });
        } else {
            throw error;
        }
    }
}

export async function deleteDataStore(d2: D2, dataStoreKey: string): Promise<void> {
    try {
        await axios.delete(getBaseUrl(d2) + `/dataStore/${dataStoreNamespace}/${dataStoreKey}`, {
            withCredentials: true,
        });
    } catch (error) {
        if (!error.response || error.response.status !== 404) {
            throw error;
        }
    }
}

export async function getData(d2: D2, dataStoreKey: string): Promise<any> {
    return getDataStore(d2, dataStoreKey, []);
}

export async function getDataById(d2: D2, dataStoreKey: string, id: string): Promise<any> {
    const rawData = await getDataStore(d2, dataStoreKey, []);
    return _.find(rawData, element => element.id === id);
}

export async function getPaginatedData(
    d2: D2,
    dataStoreKey: string,
    filters: TableFilters,
    pagination: TablePagination
): Promise<TableList> {
    const { search = null } = filters || {};
    const { page = 1, pageSize = 20, paging = true, sorting = ["id", "asc"] } = pagination || {};

    const rawData = await getDataStore(d2, dataStoreKey, []);

    const filteredData = search
        ? _.filter(rawData, o =>
              _(o)
                  .keys()
                  .filter(k => typeof o[k] === "string")
                  .some(k => o[k].toLowerCase().includes(search.toLowerCase()))
          )
        : rawData;

    const [field, direction] = sorting;
    const sortedData = _.orderBy(
        filteredData,
        [data => (data[field] ? data[field].toLowerCase() : "")],
        [direction as "asc" | "desc"]
    );

    const total = sortedData.length;
    const pageCount = paging ? Math.ceil(sortedData.length / pageSize) : 1;
    const firstItem = paging ? (page - 1) * pageSize : 0;
    const lastItem = paging ? firstItem + pageSize : sortedData.length;
    const paginatedData = _.slice(sortedData, firstItem, lastItem);

    return { objects: paginatedData, pager: { page, pageCount, total } };
}

export async function saveData(d2: D2, dataStoreKey: string, data: any): Promise<Response> {
    try {
        const dataArray = await getDataStore(d2, dataStoreKey, []);
        const newDataArray = [...dataArray, data];
        await saveDataStore(d2, dataStoreKey, newDataArray);
        return { status: true };
    } catch (e) {
        console.error(e);
        return {
            status: false,
            error: e.toString(),
        };
    }
}

export async function deleteData(d2: D2, dataStoreKey: string, data: any): Promise<Response> {
    try {
        const dataArray = await getDataStore(d2, dataStoreKey, []);
        const newDataArray = dataArray.filter(
            (dataEl: { id: string }): boolean => dataEl.id !== data.id
        );
        await saveDataStore(d2, dataStoreKey, newDataArray);
        return { status: true };
    } catch (e) {
        console.error(e);
        return {
            status: false,
            error: e.toString(),
        };
    }
}
