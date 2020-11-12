import { UseCase } from "../../common/entities/UseCase";
import { Store } from "../entities/Store";
import { GitHubRepository } from "../../packages/repositories/GitHubRepository";

export class ValidateStoreUseCase implements UseCase {
    constructor(private githubRepository: GitHubRepository) {}

    public async execute(store: Store) {
        return this.githubRepository.validateStore(store);
    }
}
