import { UseCase } from "../../common/entities/UseCase";
import { StoreRepository } from "../repositories/StoreRepository";

export class DeleteStoreUseCase implements UseCase {
    constructor(private storeRepository: StoreRepository) {}

    public async execute(id: string): Promise<boolean> {
        return this.storeRepository.delete(id);
    }
}
