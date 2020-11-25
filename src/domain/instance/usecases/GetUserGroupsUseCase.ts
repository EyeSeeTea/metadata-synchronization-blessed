import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetUserGroupsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance) {
        const userGroups = await this.repositoryFactory
            .instanceRepository(instance)
            .getUserGroups();
        return _.sortBy(userGroups, "name");
    }
}
