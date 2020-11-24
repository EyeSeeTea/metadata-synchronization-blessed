import _ from "lodash";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetUserGroupsUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(instance = this.localInstance) {
        const userGroups = await this.instanceRepository(instance).getUserGroups();
        return _.sortBy(userGroups, "name");
    }
}
