import { UseCase } from "../../common/entities/UseCase";
import { Store } from "../entities/Store";
import { StoreRepository } from "../repositories/StoreRepository";

export class GetStoreUseCase implements UseCase {
    constructor(private storeRepository: StoreRepository) {}

    public async execute(id: string): Promise<Store | undefined> {
        return this.storeRepository.getById(id);
    }
}
