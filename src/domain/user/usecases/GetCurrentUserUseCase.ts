import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryFactory";
import { User } from "../entities/User";
import { Instance } from "../../instance/entities/Instance";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute(): Promise<User> {
        return this.repositoryFactory.userRepository(this.localInstance).getCurrent();
    }
}
