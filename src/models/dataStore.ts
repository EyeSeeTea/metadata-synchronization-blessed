import _ from "lodash";
import { D2, Response } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";

const dataStoreNamespace = "metatada-synchronization";

async function getOrCreateNamespace(d2: D2): Promise<any> {
    const existsNamespace = await d2.dataStore.has(dataStoreNamespace);
    if (!existsNamespace) {
        return await d2.dataStore.create(dataStoreNamespace);
    } else {
        return await d2.dataStore.get(dataStoreNamespace);
    }
}

async function getDataStore(d2: D2, dataStoreKey: string, defaultValue: any = []): Promise<any> {
    const existsNamespace = await d2.dataStore.has(dataStoreNamespace);
    const dataStore = await getOrCreateNamespace(d2);
    if (!existsNamespace) {
        await dataStore.set(dataStoreKey, defaultValue);
    }
    return await dataStore.get(dataStoreKey);
}

async function saveDataStore(d2: D2, dataStoreKey: string, newValue: any): Promise<void> {
    const dataStore = await getOrCreateNamespace(d2);
    await dataStore.set(dataStoreKey, newValue);
}

export async function getData(d2: D2, dataStoreKey: string): Promise<any> {
    return await getDataStore(d2, dataStoreKey);
}

export async function getDataById(d2: D2, dataStoreKey: string, id: string): Promise<any> {
    const rawData = await getDataStore(d2, dataStoreKey);
    return _.find(rawData, instance => instance.id === id);
}

export async function getPaginatedData(
    d2: D2,
    dataStoreKey: string,
    filters: TableFilters,
    pagination: TablePagination
): Promise<TableList> {
    const rawData = await getDataStore(d2, dataStoreKey);
    const { search = null } = filters || {};
    const filteredData = _.filter(rawData, o =>
        _(o)
            .keys()
            .some(k => o[k].toLowerCase().includes(search ? search.toLowerCase() : ""))
    );

    const { sorting = ["id", "asc"] } = pagination || {};
    const [field, direction] = sorting;
    const sortedData = _.orderBy(
        filteredData,
        [data => (data[field] ? data[field].toLowerCase() : "")],
        [direction as "asc" | "desc"]
    );

    const { page = 1, pageSize = 20 } = pagination || {};
    const currentlyShown = (page - 1) * pageSize;
    const pageCount = Math.ceil(sortedData.length / pageSize);
    const total = sortedData.length;
    const paginatedData = _.slice(sortedData, currentlyShown, currentlyShown + pageSize);
    return { objects: paginatedData, pager: { page, pageCount, total } };
}

export async function saveData(d2: D2, dataStoreKey: string, data: any): Promise<Response> {
    try {
        const dataArray = await getDataStore(d2, dataStoreKey);
        const newDataArray = [...dataArray, data];
        await saveDataStore(d2, dataStoreKey, newDataArray);
        return { status: true };
    } catch (e) {
        return {
            status: false,
            error: e.toString(),
        };
    }
}

export async function deleteData(d2: D2, dataStoreKey: string, data: any): Promise<Response> {
    try {
        const dataArray = await getDataStore(d2, dataStoreKey);
        const newDataArray = dataArray.filter((dataEl: { id: string }) => dataEl.id !== data.id);
        await saveDataStore(d2, dataStoreKey, newDataArray);
        return { status: true };
    } catch (e) {
        return {
            status: false,
            error: e.toString(),
        };
    }
}
