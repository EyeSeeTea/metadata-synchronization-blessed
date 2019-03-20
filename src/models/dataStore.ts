import _ from "lodash";
import { D2, Response } from "../types/d2-types";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { Data as InstanceData } from "./instance";

const dataStoreNamespace = "metatada-synchronization";
const instancesKey = "instances";

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

export async function getDataStoreData(d2: D2, dataStoreKey: string) {
    return await getDataStore(d2, dataStoreKey);
}

export async function listInstances(
    d2: D2,
    filters: TableFilters,
    pagination: TablePagination
): Promise<TableList> {
    const instanceArray = await getDataStore(d2, instancesKey);
    const { search = null } = filters || {};
    const filteredInstances = _.filter(instanceArray, o =>
        _(o)
            .keys()
            .some(k => o[k].toLowerCase().includes(search ? search.toLowerCase() : ""))
    );

    const { sorting = ["id", "asc"] } = pagination || {};
    const [field, direction] = sorting;
    const sortedInstances = _.orderBy(
        filteredInstances,
        [instance => instance[field].toLowerCase()],
        [direction]
    );

    const { page = 1, pageSize = 20 } = pagination || {};
    const currentlyShown = (page - 1) * pageSize;
    const pageCount = Math.ceil(sortedInstances.length / pageSize);
    const total = sortedInstances.length;
    const paginatedInstances = _.slice(sortedInstances, currentlyShown, currentlyShown + pageSize);
    console.log(paginatedInstances);
    return { objects: paginatedInstances, pager: { page, pageCount, total } };
}

export async function saveNewInstance(d2: D2, instance: any): Promise<Response> {
    try {
        const instanceArray = await getDataStore(d2, instancesKey);
        const newInstanceArray = [...instanceArray, instance];
        await saveDataStore(d2, instancesKey, newInstanceArray);
        return { status: true };
    } catch (e) {
        return {
            status: false,
            error: e.toString(),
        };
    }
}

export async function deleteInstance(d2: D2, instance: any): Promise<Response> {
    try {
        const instanceArray = await getDataStore(d2, instancesKey);
        const newInstanceArray = _.differenceWith(
            instanceArray,
            [instance],
            (inst: InstanceData) => inst.id === instance.id
        );
        await saveDataStore(d2, instancesKey, newInstanceArray);
        return { status: true };
    } catch (e) {
        return {
            status: false,
            error: e.toString(),
        };
    }
}
