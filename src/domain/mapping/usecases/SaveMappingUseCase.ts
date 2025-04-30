import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { SaveMappingError } from "../repositories/MappingRepository";

export class SaveMappingUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, protected localInstance: Instance) {}

    public async execute(mapping: DataSourceMapping): Promise<Either<SaveMappingError, void>> {
        return this.repositoryFactory.mappingRepository(this.localInstance).save(mapping);
    }
}
