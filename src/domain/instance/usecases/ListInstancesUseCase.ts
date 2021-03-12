import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";
import { InstancesFilter } from "../repositories/InstanceRepository";

export class ListInstancesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(filters: InstancesFilter = {}): Promise<Instance[]> {
        return this.repositoryFactory.instanceRepository(this.localInstance).getAll(filters);
    }
}
