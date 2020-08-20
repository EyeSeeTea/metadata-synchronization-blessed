import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Repositories } from "../../Repositories";
import { Instance } from "../entities/Instance";
import { InstanceRepositoryConstructor } from "../repositories/InstanceRepository";

export class GetUserGroupsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance) {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );

        const userGroups = await instanceRepository.getUserGroups();
        return _.sortBy(userGroups, "name");
    }
}
