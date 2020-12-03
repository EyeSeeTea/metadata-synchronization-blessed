import { UseCase } from "../../common/entities/UseCase";
import { Store } from "../entities/Store";
import { StoreRepository } from "../repositories/StoreRepository";

export class ListStoresUseCase implements UseCase {
    constructor(private storeRepository: StoreRepository) {}

    public async execute(): Promise<Store[]> {
        return this.storeRepository.list();
    }
}
