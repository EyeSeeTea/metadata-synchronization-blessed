import _ from "lodash";

const dataStoreNamespace = "metatada-synchronization";
const instancesKey = "instances";

async function getDataStore(d2, dataStoreKey, defaultValue = []) {
    const existsNamespace = await d2.dataStore.has(dataStoreNamespace);
    if (!existsNamespace) {
        const dataStore = await d2.dataStore.create(dataStoreNamespace);
        await dataStore.set(dataStoreKey, defaultValue);
        return defaultValue;
    } else {
        const dataStore = await d2.dataStore.get(dataStoreNamespace);
        return await dataStore.get(dataStoreKey);
    }
}

async function saveDataStore(d2, dataStoreKey, newValue) {
    const existsNamespace = await d2.dataStore.has(dataStoreNamespace);
    if (!existsNamespace) {
        const dataStore = await d2.dataStore.create(dataStoreNamespace);
        await dataStore.set(dataStoreKey, newValue);
    } else {
        const dataStore = await d2.dataStore.get(dataStoreNamespace);
        await dataStore.set(dataStoreKey, newValue);
    }
}

export async function listInstances(d2, filters, pagination) {
    const instanceArray = await getDataStore(d2, instancesKey);

    const field = pagination.sorting.field;
    const direction = pagination.sorting.direction;
    const newSortingDirection = _.some(['iasc', 'idesc'],
        dir => dir === direction) ? direction.substr(1) : direction;
    const sortedInstances = _.sortBy(instanceArray,
        [instance => instance[field].toLowerCase(), [newSortingDirection]]);

    const filteredInstances = _.filter(sortedInstances,
        o => _(o).keys().some(k => o[k].toLowerCase().includes(filters.search.toLowerCase())));

    return {objects: filteredInstances, pager: {total: 0}};
}

export async function saveNewInstance(d2, instance) {
    try {
        const instanceArray = await getDataStore(d2, instancesKey);
        const newInstanceArray = [...instanceArray, instance];
        await saveDataStore(d2, instancesKey, newInstanceArray);
        return { status: true }
    } catch (e) {
        return {
            status: false,
            error: e
        }
    }
}
