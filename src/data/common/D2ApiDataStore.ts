import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { DataStore, DataStoreKey } from "../../domain/metadata/entities/MetadataEntities";
import { promiseMap } from "../../utils/common";
import { DataStoreMetadata } from "../../domain/data-store/DataStoreMetadata";
import { Instance } from "../../domain/instance/entities/Instance";

export class D2ApiDataStore {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    async getDataStores(filter: { namespaces?: string[] }): Promise<DataStore[]> {
        const response = await this.api.request<string[]>({ method: "get", url: "/dataStore" }).getData();
        const namespacesWithKeys = await this.getAllKeysFromNamespaces(
            filter.namespaces
                ? DataStoreMetadata.getDataStoreIds(filter.namespaces || []).map(ns => {
                      const [namespace] = ns.split(DataStoreMetadata.NS_SEPARATOR);
                      return namespace;
                  })
                : response
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
                id: [namespace, DataStoreMetadata.NS_SEPARATOR].join(""),
                keys: keys,
                name: namespace,
                translations: [],
            };
        });
        return result;
    }

    private async getKeysPaginated(keysState: DataStoreKey[], namespace: string): Promise<DataStoreKey[]> {
        const keyResponse = await this.getKeysByNameSpace(namespace);
        return [...keysState, ...keyResponse];
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
        return keys.map(key => ({ id: DataStoreMetadata.generateKeyId(namespace, key), displayName: key }));
    }
}
