import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetRootOrgUnitUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance) {
        return this.repositoryFactory.instanceRepository(instance).getOrgUnitRoots();
    }
}
