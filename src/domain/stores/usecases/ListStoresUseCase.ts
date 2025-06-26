import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Store } from "../entities/Store";

export class ListStoresUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<Store[]> {
        return this.repositoryFactory.storeRepository(this.localInstance).list();
    }
}
