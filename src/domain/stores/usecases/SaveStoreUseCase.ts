import { generateUid } from "d2/uid";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { GitHubError } from "../../packages/entities/Errors";
import { GitHubRepository } from "../../packages/repositories/GitHubRepository";
import { Store } from "../entities/Store";

export class SaveStoreUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private gitHubRepository: GitHubRepository,
        private localInstance: Instance
    ) {}

    public async execute(store: Store, validate = true): Promise<Either<GitHubError, Store>> {
        if (validate) {
            const validation = await this.gitHubRepository.validateStore(store);
            if (validation.isError()) return Either.error(validation.value.error ?? "UNKNOWN");
        }

        const currentStores = await this.repositoryFactory.storeRepository(this.localInstance).list();

        const isFirstStore = !store.id && currentStores.length === 0;

        await this.repositoryFactory.storeRepository(this.localInstance).save({
            ...store,
            id: store.id || generateUid(),
            default: isFirstStore || store.default,
        });

        return Either.success(store);
    }
}
