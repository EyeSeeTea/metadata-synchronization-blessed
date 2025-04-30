import { D2Api } from "../../../types/d2-api";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryByInstanceFactory";
import { Instance } from "../entities/Instance";

export class GetInstanceApiUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public execute(instance = this.localInstance): D2Api {
        return this.repositoryFactory.instanceRepository(instance).getApi();
    }
}
