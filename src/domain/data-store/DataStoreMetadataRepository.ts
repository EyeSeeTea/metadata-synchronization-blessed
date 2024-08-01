import { Instance } from "../instance/entities/Instance";
import { MetadataImportParams } from "../metadata/entities/MetadataSynchronizationParams";
import { SynchronizationResult } from "../reports/entities/SynchronizationResult";
import { DataStoreMetadata } from "./DataStoreMetadata";

export interface DataStoreMetadataRepositoryConstructor {
    new (instance: Instance): DataStoreMetadataRepository;
}

export interface DataStoreMetadataRepository {
    get(namespaces: DataStoreMetadata[]): Promise<DataStoreMetadata[]>;
    save(namespaces: DataStoreMetadata[], options: SaveOptions): Promise<SynchronizationResult>;
}

export type SaveOptions = { mergeMode: MetadataImportParams["mergeMode"] };
