import { Store } from "../entities/Store";
import { GitHubRepository } from "../repositories/GitHubRepository";

export class ValidateStoreUseCase {
    constructor(private githubRepository: GitHubRepository) {}

    public async execute(store: Store) {
        return this.githubRepository.validateStore(store);
    }
}
