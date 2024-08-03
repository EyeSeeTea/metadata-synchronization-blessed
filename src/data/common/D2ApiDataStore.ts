import { D2Api } from "../../types/d2-api";
import { DataSource, isDhisInstance } from "../../domain/instance/entities/DataSource";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { DataStore, DataStoreKey } from "../../domain/metadata/entities/MetadataEntities";
import { promiseMap } from "../../utils/common";
import { DataStoreMetadata } from "../../domain/data-store/DataStoreMetadata";

export class D2ApiDataStore {
    private api: D2Api;

    constructor(instance: DataSource) {
        if (!isDhisInstance(instance)) {
            throw new Error("Invalid instance type for MetadataD2ApiRepository");
        }
        this.api = getD2APiFromInstance(instance);
    }

    async getDataStore(filter: { namespaces: string[] }): Promise<DataStore[]> {
        const response = await this.api.request<string[]>({ method: "get", url: "/dataStore" }).getData();
        const namespacesWithKeys = await this.getAllKeysFromNamespaces(
            filter.namespaces.length === 0
                ? response
                : DataStoreMetadata.getDataStoreIds(filter.namespaces).map(ns => {
                      const [namespace] = ns.split(DataStoreMetadata.NS_SEPARATOR);
                      return namespace;
                  })
        );
        return namespacesWithKeys;
    }

    private async getAllKeysFromNamespaces(namespaces: string[]): Promise<DataStore[]> {
        const result = await promiseMap<string, DataStore>(namespaces, async namespace => {
            const keys = await this.getKeysPaginated([], namespace);
            return {
                code: namespace,
                displayName: namespace,
                externalAccess: false,
                favorites: [],
                id: `${namespace}${DataStoreMetadata.NS_SEPARATOR}`,
                keys: keys,
                name: namespace,
                translations: [],
            };
        });
        return result;
    }

    private async getKeysPaginated(keysState: DataStoreKey[], namespace: string): Promise<DataStoreKey[]> {
        const keyResponse = await this.getKeysByNameSpace(namespace);
        const newKeys = [...keysState, ...keyResponse];
        return newKeys;
    }

    private async getKeysByNameSpace(namespace: string): Promise<DataStoreKey[]> {
        const response = await this.api
            .request<string[]>({
                method: "get",
                url: `/dataStore/${namespace}`,
                // Since v38 we can use the fields parameter to get keys and values in the same request
                // Empty fields returns a paginated response
                // https://docs.dhis2.org/en/full/develop/dhis-core-version-240/developer-manual.html#query-api
                // params: { fields: "", page: page, pageSize: 200 },
            })
            .getData();

        return this.buildArrayDataStoreKey(response, namespace);
    }

    private buildArrayDataStoreKey(keys: string[], namespace: string): DataStoreKey[] {
        return keys.map(key => ({ id: `${namespace}${DataStoreMetadata.NS_SEPARATOR}${key}`, displayName: key }));
    }
}
