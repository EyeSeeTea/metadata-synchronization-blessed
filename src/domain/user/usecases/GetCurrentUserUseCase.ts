import { UseCase } from "../../common/entities/UseCase";
import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private userRepository: UserRepository) {}

    public async execute(): Promise<User> {
        return this.userRepository.getCurrent();
    }
}
