import { D2Api } from "../../../types/d2-api";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Repositories } from "../../Repositories";
import { Instance } from "../entities/Instance";
import { InstanceRepositoryConstructor } from "../repositories/InstanceRepository";

export class GetInstanceApiUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public execute(instance = this.localInstance): D2Api {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );

        return instanceRepository.getApi();
    }
}
