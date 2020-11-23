import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { GitHubError } from "../../packages/entities/Errors";
import { GitHubRepository } from "../../packages/repositories/GitHubRepository";
import { Store } from "../entities/Store";
import { StoreRepository } from "../repositories/StoreRepository";

export class SaveStoreUseCase implements UseCase {
    constructor(
        private githubRepository: GitHubRepository,
        private storeRepository: StoreRepository
    ) {}

    public async execute(store: Store, validate = true): Promise<Either<GitHubError, Store>> {
        if (validate) {
            const validation = await this.githubRepository.validateStore(store);
            if (validation.isError()) return Either.error(validation.value.error ?? "UNKNOWN");
        }

        await this.storeRepository.save(store);

        return Either.success(store);
    }
}
