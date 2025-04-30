import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetRootOrgUnitUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance) {
        return this.repositoryFactory.instanceRepository(instance).getOrgUnitRoots();
    }
}
