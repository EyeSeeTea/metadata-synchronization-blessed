import { StorageClientFactory } from "../../../data/config/StorageClientFactory";
import { Either } from "../../common/entities/Either";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { MappingOwner } from "../entities/MappingOwner";

export interface MappingRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory): MappingRepository;
}

export type SaveMappingError = "UNEXPECTED_ERROR";

export interface MappingRepository {
    getByOwner(owner: MappingOwner): Promise<DataSourceMapping | undefined>;
    save(mapping: DataSourceMapping): Promise<Either<SaveMappingError, void>>;
}
