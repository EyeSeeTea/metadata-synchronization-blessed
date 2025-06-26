import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { DataSourceMapping } from "../entities/DataSourceMapping";
import { MappingOwner } from "../entities/MappingOwner";

export class GetMappingByOwnerUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, protected localInstance: Instance) {}

    public async execute(owner: MappingOwner): Promise<DataSourceMapping | undefined> {
        return this.repositoryFactory.mappingRepository(this.localInstance).getByOwner(owner);
    }
}
