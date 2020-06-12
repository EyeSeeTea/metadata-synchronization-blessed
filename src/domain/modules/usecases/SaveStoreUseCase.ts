import { Either } from "../../common/entities/Either";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { GitHubError } from "../entities/Errors";
import { Store } from "../entities/Store";
import { GitHubRepository } from "../repositories/GitHubRepository";

export class SaveStoreUseCase {
    constructor(
        private githubRepository: GitHubRepository,
        private storageRepository: StorageRepository
    ) {}

    public async execute(store: Store, validate = true): Promise<Either<void, GitHubError>> {
        if (validate) {
            const validation = await this.githubRepository.validateStore(store);
            if (validation.isFailure()) return Either.Failure(validation.error ?? "UNKNOWN");
        }

        await this.storageRepository.saveObject("GITHUB_SETTINGS", store);
        return Either.Success(undefined);
    }
}
