import { Either } from "../../common/entities/Either";
import { StorageClientRepository } from "../../storage-client-config/repositories/StorageClientRepository";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { MappingOwner } from "../entities/MappingOwner";

export interface MappingRepositoryConstructor {
    new (configRepository: StorageClientRepository): MappingRepository;
}

export type SaveMappingError = "UNEXPECTED_ERROR";

export interface MappingRepository {
    getByOwner(owner: MappingOwner): Promise<DataSourceMapping | undefined>;
    save(mapping: DataSourceMapping): Promise<Either<SaveMappingError, void>>;
}
