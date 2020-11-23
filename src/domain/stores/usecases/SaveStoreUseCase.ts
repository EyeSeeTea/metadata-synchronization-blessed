import { generateUid } from "d2/uid";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../../data/storage/Namespaces";
import { StorageClient } from "../../storage/repositories/StorageClient";
import { GitHubError } from "../../packages/entities/Errors";
import { Store } from "../entities/Store";
import { GitHubRepository } from "../../packages/repositories/GitHubRepository";

export class SaveStoreUseCase implements UseCase {
    constructor(
        private githubRepository: GitHubRepository,
        private storageRepository: StorageClient
    ) {}

    public async execute(store: Store, validate = true): Promise<Either<GitHubError, Store>> {
        if (validate) {
            const validation = await this.githubRepository.validateStore(store);
            if (validation.isError()) return Either.error(validation.value.error ?? "UNKNOWN");
        }

        const isFirstStore = await this.isFirstStore(store);

        const storeToSave = {
            ...store,
            id: store.id || generateUid(),
            default: isFirstStore ? true : store.default,
        };

        await this.storageRepository.saveObjectInCollection(Namespace.STORES, storeToSave);

        return Either.success(storeToSave);
    }

    private async isFirstStore(store: Store) {
        const currentStores = (
            await this.storageRepository.getObject<Store[]>(Namespace.STORES)
        )?.filter(store => !store.deleted);

        return !store.id && (!currentStores || currentStores.length === 0);
    }
}
