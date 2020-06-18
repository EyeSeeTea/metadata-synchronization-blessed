import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Store } from "../entities/Store";

export class GetStoreUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(): Promise<Store> {
        return await this.storageRepository.getObject<Store>(Namespace.STORE, {
            token: "",
            account: "",
            repository: "",
        });
    }
}
