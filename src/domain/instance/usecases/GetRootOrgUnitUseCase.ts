import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetRootOrgUnitUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance) {
        return this.repositoryFactory.instanceRepository(instance).getOrgUnitRoots();
    }
}
