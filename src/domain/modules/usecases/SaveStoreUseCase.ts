import { Either } from "../../common/entities/Either";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { GitHubError } from "../entities/Errors";
import { Store } from "../entities/Store";
import { GitHubRepository } from "../repositories/GitHubRepository";

export class SaveStoreUseCase {
    constructor(
        private githubRepository: GitHubRepository,
        private storageRepository: StorageRepository
    ) {}

    public async execute(store: Store, validate = true): Promise<Either<GitHubError, void>> {
        if (validate) {
            const validation = await this.githubRepository.validateStore(store);
            if (validation.isError()) return Either.error(validation.value.error ?? "UNKNOWN");
        }

        await this.storageRepository.saveObject(Namespace.STORE, store);
        return Either.success(undefined);
    }
}
