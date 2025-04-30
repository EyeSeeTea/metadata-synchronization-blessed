import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { MappingOwner } from "../entities/MappingOwner";

export class GetMappingByOwnerUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, protected localInstance: Instance) {}

    public async execute(owner: MappingOwner): Promise<DataSourceMapping | undefined> {
        return this.repositoryFactory.mappingRepository(this.localInstance).getByOwner(owner);
    }
}
