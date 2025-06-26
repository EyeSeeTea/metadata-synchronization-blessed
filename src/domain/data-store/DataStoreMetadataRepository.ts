import { SynchronizationResult } from "../reports/entities/SynchronizationResult";
import { DataStoreMetadata } from "./DataStoreMetadata";

export interface DataStoreMetadataRepository {
    get(namespaces: DataStoreMetadata[]): Promise<DataStoreMetadata[]>;
    save(namespaces: DataStoreMetadata[]): Promise<SynchronizationResult>;
}
