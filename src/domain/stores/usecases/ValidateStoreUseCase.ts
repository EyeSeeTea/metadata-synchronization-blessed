import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Store } from "../entities/Store";

export class ValidateStoreUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory) {}

    public async execute(store: Store) {
        return this.repositoryFactory.gitRepository().validateStore(store);
    }
}
