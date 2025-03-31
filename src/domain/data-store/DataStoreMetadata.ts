import _ from "lodash";
import { Maybe } from "../../types/utils";
import { Id } from "../common/entities/Schemas";
import { MetadataImportParams } from "../metadata/entities/MetadataSynchronizationParams";
import { ObjectSharing } from "../storage/repositories/StorageClient";

export type DataStoreNamespace = string;
export type DataStoreKey = { id: string; value: any };

export type DataStoreAttrs = {
    namespace: DataStoreNamespace;
    keys: DataStoreKey[];
    sharing: Maybe<ObjectSharing>;
    action?: MetadataImportParams["mergeMode"];
};
export type DataStoreOptions = { action: MetadataImportParams["mergeMode"] };
type NamespaceWithAction = { namespace: DataStoreNamespace; options: DataStoreOptions };

export class DataStoreMetadata {
    public readonly namespace: DataStoreNamespace;
    public readonly keys: DataStoreKey[];
    public readonly sharing: Maybe<ObjectSharing>;
    public readonly action?: MetadataImportParams["mergeMode"];

    static NS_SEPARATOR = "[NS]";

    constructor(data: DataStoreAttrs) {
        this.keys = data.keys;
        this.namespace = data.namespace;
        this.sharing = data.sharing;
        this.action = data.action;
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
                        .map(key => (key.key ? { id: key.key, value: "" } : undefined))
                        .compact()
                        .value(),
                    sharing: undefined,
                });
            })
            .value();

        return result;
    }

    static combine(
        ids: Id[],
        origin: DataStoreMetadata[],
        destination: DataStoreMetadata[],
        options: DataStoreOptions
    ): DataStoreMetadata[] {
        const destinationDataStore = _.keyBy(destination, "namespace");
        const namespacesWithAction = this.mergeOrReplaceNameSpace(ids, options);

        return _(origin)
            .map(originItem => {
                const namespaceAction = namespacesWithAction.find(
                    ({ namespace }) => namespace === originItem.namespace
                );
                const destItem = destinationDataStore[originItem.namespace];

                if (!destItem) return originItem;

                const combinedKeys =
                    namespaceAction?.options.action === "MERGE"
                        ? _(originItem.keys)
                              .unionBy(destItem.keys, record => record.id)
                              .value()
                        : originItem.keys;

                return new DataStoreMetadata({
                    namespace: originItem.namespace,
                    keys: combinedKeys,
                    sharing: originItem.sharing,
                    action: namespaceAction?.options.action,
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

    static isDataStoreId(id: string): boolean {
        return id.includes(DataStoreMetadata.NS_SEPARATOR);
    }

    static isNamespaceOnlySelected(id: DataStoreNamespace): boolean {
        return _(id).split(DataStoreMetadata.NS_SEPARATOR).compact().value().length === 1;
    }

    static mergeOrReplaceNameSpace(metadataIds: Id[], options: DataStoreOptions): NamespaceWithAction[] {
        return _(metadataIds)
            .map((id): Maybe<NamespaceWithAction> => {
                if (!this.isDataStoreId(id)) return undefined;
                const [namespace] = id.split(DataStoreMetadata.NS_SEPARATOR);
                if (!namespace) return undefined;

                const isNamespaceSelected = this.isNamespaceOnlySelected(id);
                return { namespace: namespace, options: { action: isNamespaceSelected ? options.action : "MERGE" } };
            })
            .compact()
            .value();
    }

    static generateKeyId(namespace: DataStoreNamespace, keyId: string) {
        return [namespace, DataStoreMetadata.NS_SEPARATOR, keyId].join("");
    }
}
