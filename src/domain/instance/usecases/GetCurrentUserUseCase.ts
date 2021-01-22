import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";
import { User } from "../entities/User";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance): Promise<User> {
        return this.repositoryFactory.instanceRepository(instance).getUser();
    }
}
