import { generateUid } from "d2/uid";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { GitHubError } from "../entities/Errors";
import { Store } from "../entities/Store";
import { GitHubRepository } from "../repositories/GitHubRepository";

export class SaveStoreUseCase implements UseCase {
    constructor(
        private githubRepository: GitHubRepository,
        private storageRepository: StorageRepository
    ) {}

    public async execute(store: Store, validate = true): Promise<Either<GitHubError, void>> {
        if (validate) {
            const validation = await this.githubRepository.validateStore(store);
            if (validation.isError()) return Either.error(validation.value.error ?? "UNKNOWN");
        }

        const storeToSave = !store.id ? { ...store, id: generateUid() } : store;

        await this.storageRepository.saveObjectInCollection(Namespace.STORES, storeToSave);
        return Either.success(undefined);
    }
}
