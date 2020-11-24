import { D2Api } from "../../../types/d2-api";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetInstanceApiUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public execute(instance = this.localInstance): D2Api {
        return this.instanceRepository(instance).getApi();
    }
}
