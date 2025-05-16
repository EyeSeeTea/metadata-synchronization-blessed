import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { User } from "../entities/User";
import { Instance } from "../../instance/entities/Instance";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<User> {
        return this.repositoryFactory.userRepository(this.localInstance).getCurrent();
    }
}
