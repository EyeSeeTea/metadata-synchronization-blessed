import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryByInstanceFactory";
import { Instance } from "../entities/Instance";
import { InstancesFilter } from "../repositories/InstanceRepository";

export class ListInstancesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute(filters: InstancesFilter = {}): Promise<Instance[]> {
        return this.repositoryFactory.instanceRepository(this.localInstance).getAll(filters);
    }
}
