import { D2Api } from "../../../types/d2-api";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetInstanceApiUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public execute(instance = this.localInstance): D2Api {
        return this.repositoryFactory.instanceRepository(instance).getApi();
    }
}
