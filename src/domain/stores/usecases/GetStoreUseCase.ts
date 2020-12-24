import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Store } from "../entities/Store";

export class GetStoreUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<Store | undefined> {
        return this.repositoryFactory.storeRepository(this.localInstance).getById(id);
    }
}
