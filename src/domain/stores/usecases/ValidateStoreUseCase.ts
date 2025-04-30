import { UseCase } from "../../common/entities/UseCase";
import { GitHubRepository } from "../../packages/repositories/GitHubRepository";
import { Store } from "../entities/Store";

export class ValidateStoreUseCase implements UseCase {
    constructor(private gitHubRepository: GitHubRepository) {}

    public async execute(store: Store) {
        return this.gitHubRepository.validateStore(store);
    }
}
