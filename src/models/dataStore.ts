import { D2Api } from "d2-api";
import _ from "lodash";
import { Response } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";

const dataStoreNamespace = "metadata-synchronization";

export async function getDataStore(
    api: D2Api,
    dataStoreKey: string,
    defaultValue: any
): Promise<any> {
    const dataStore = api.dataStore(dataStoreNamespace);
    const value = await dataStore.get(dataStoreKey).getData();
    if (!value) await dataStore.save(dataStoreKey, defaultValue).getData();
    return value ?? defaultValue;
}

export async function saveDataStore(api: D2Api, dataStoreKey: string, value: any): Promise<void> {
    const dataStore = api.dataStore(dataStoreNamespace);
    await dataStore.save(dataStoreKey, value).getData();
}

export async function deleteDataStore(api: D2Api, dataStoreKey: string): Promise<void> {
    try {
        await api.delete(`/dataStore/${dataStoreNamespace}/${dataStoreKey}`).getData();
    } catch (error) {
        if (!error.response || error.response.status !== 404) {
            throw error;
        }
    }
}

export async function getData(api: D2Api, dataStoreKey: string): Promise<any> {
    return getDataStore(api, dataStoreKey, []);
}

export async function getDataById(api: D2Api, dataStoreKey: string, id: string): Promise<any> {
    const rawData = await getDataStore(api, dataStoreKey, []);
    return _.find(rawData, element => element.id === id);
}

export async function getPaginatedData(
    api: D2Api,
    dataStoreKey: string,
    filters: TableFilters | null,
    pagination: TablePagination | null
): Promise<TableList> {
    const { search = null } = filters || {};
    const { page = 1, pageSize = 20, paging = true, sorting = ["id", "asc"] } = pagination || {};

    const rawData = await getDataStore(api, dataStoreKey, []);

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

export async function saveData(api: D2Api, dataStoreKey: string, data: any): Promise<Response> {
    try {
        const dataArray = await getDataStore(api, dataStoreKey, []);
        const newDataArray = _([...dataArray, data])
            .reverse()
            .uniqBy("id")
            .reverse()
            .value();
        await saveDataStore(api, dataStoreKey, newDataArray);
        return { status: true };
    } catch (e) {
        console.error(e);
        return {
            status: false,
            error: e.toString(),
        };
    }
}

export async function deleteData(api: D2Api, dataStoreKey: string, data: any): Promise<Response> {
    try {
        const dataArray = await getDataStore(api, dataStoreKey, []);
        const newDataArray = dataArray.filter(
            (dataEl: { id: string }): boolean => dataEl.id !== data.id
        );
        await saveDataStore(api, dataStoreKey, newDataArray);
        return { status: true };
    } catch (e) {
        console.error(e);
        return {
            status: false,
            error: e.toString(),
        };
    }
}
