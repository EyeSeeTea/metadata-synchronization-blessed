import { Instance } from "../instance/entities/Instance";
import { SynchronizationResult } from "../reports/entities/SynchronizationResult";
import { DataStoreMetadata } from "./DataStoreMetadata";

export interface DataStoreMetadataRepositoryConstructor {
    new (instance: Instance): DataStoreMetadataRepository;
}

export interface DataStoreMetadataRepository {
    get(namespaces: DataStoreMetadata[]): Promise<DataStoreMetadata[]>;
    save(namespaces: DataStoreMetadata[]): Promise<SynchronizationResult>;
}
