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

    public async execute(store: Store, validate = true): Promise<Either<GitHubError, Store>> {
        if (validate) {
            const validation = await this.githubRepository.validateStore(store);
            if (validation.isError()) return Either.error(validation.value.error ?? "UNKNOWN");
        }

        const isFirstStore = await this.isFirstStore(store);

        const isNew = !store.id;

        const storeToSave = isNew
            ? { ...store, id: generateUid(), default: isFirstStore ? true : store.default }
            : store;

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
