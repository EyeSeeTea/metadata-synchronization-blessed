import { Either } from "../../common/entities/Either";
import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { MappingOwner } from "../entities/MappingOwner";

export interface MappingRepositoryConstructor {
    new (configRepository: ConfigRepository): MappingRepository;
}

export type SaveMappingError = "UNEXPECTED_ERROR";

export interface MappingRepository {
    getByOwner(owner: MappingOwner): Promise<DataSourceMapping | undefined>;
    save(mapping: DataSourceMapping): Promise<Either<SaveMappingError, void>>;
}
