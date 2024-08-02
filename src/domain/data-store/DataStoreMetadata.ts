import _ from "lodash";
import { Maybe } from "../../types/utils";
import { MetadataImportParams } from "../metadata/entities/MetadataSynchronizationParams";
import { ObjectSharing } from "../storage/repositories/StorageClient";

export type DataStoreNamespace = string;
export type DataStoreKey = { id: string; value: any };

export type DataStoreAttrs = { namespace: DataStoreNamespace; keys: DataStoreKey[]; sharing: Maybe<ObjectSharing> };

export class DataStoreMetadata {
    public readonly namespace: DataStoreNamespace;
    public readonly keys: DataStoreKey[];
    public readonly sharing: Maybe<ObjectSharing>;

    static NS_SEPARATOR = "[NS]";

    constructor(data: DataStoreAttrs) {
        this.keys = data.keys;
        this.namespace = data.namespace;
        this.sharing = data.sharing;
    }

    static buildFromKeys(keysWithNamespaces: string[]): DataStoreMetadata[] {
        const dataStoreIds = this.getDataStoreIds(keysWithNamespaces);

        const namespaceAndKey = dataStoreIds.map(dataStoreId => {
            const match = dataStoreId.split(DataStoreMetadata.NS_SEPARATOR);
            if (!match) {
                throw new Error(`dataStore value does not match expected format: ${dataStoreId}`);
            }
            const [namespace, key] = match;
            return { namespace, key };
        });

        const groupByNamespace = _(namespaceAndKey)
            .groupBy(record => record.namespace)
            .value();

        const result = _(groupByNamespace)
            .map((keys, namespace) => {
                return new DataStoreMetadata({
                    namespace,
                    keys: _(keys)
                        .map(key => {
                            if (!key.key) return undefined;
                            return { id: key.key, value: "" };
                        })
                        .compact()
                        .value(),
                    sharing: undefined,
                });
            })
            .value();

        return result;
    }

    static combine(
        origin: DataStoreMetadata[],
        destination: DataStoreMetadata[],
        action: MetadataImportParams["mergeMode"] = "MERGE"
    ): DataStoreMetadata[] {
        const destinationDataStore = _.keyBy(destination, "namespace");

        return _(origin)
            .map(originItem => {
                const destItem = destinationDataStore[originItem.namespace];

                if (!destItem) return originItem;

                const combinedKeys =
                    action === "MERGE"
                        ? _(originItem.keys)
                              .unionBy(destItem.keys, record => record.id)
                              .value()
                        : originItem.keys;

                return new DataStoreMetadata({
                    namespace: originItem.namespace,
                    keys: combinedKeys,
                    sharing: originItem.sharing,
                });
            })
            .value();
    }

    static removeSharingSettings(dataStores: DataStoreMetadata[]): DataStoreMetadata[] {
        return dataStores.map(dataStore => {
            return new DataStoreMetadata({
                namespace: dataStore.namespace,
                keys: dataStore.keys,
                sharing: undefined,
            });
        });
    }

    static getDataStoreIds(keys: string[]): string[] {
        return keys.filter(id => id.includes(DataStoreMetadata.NS_SEPARATOR));
    }
}
