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

    const { searchValue = "" } = filters || {};
    const filteredInstances = _.filter(instanceArray,
        o => _(o).keys().some(k => o[k].toLowerCase().includes(searchValue.toLowerCase())));

    const { sorting } = pagination || {};
    const [field, direction] = sorting || [];
    const sortedInstances = _.sortBy(filteredInstances,
        [instance => instance[field].toLowerCase(), [direction]]);

    const { page = 1, pageSize = 20 } = pagination || {};
    const currentPosition = (page - 1) * pageSize;
    const paginatedInstances = _.slice(sortedInstances, currentPosition, currentPosition + pageSize);

    return {objects: paginatedInstances, pager: {total: 0}};
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
