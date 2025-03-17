import { FutureData } from "../../common/entities/Future";
import { AppStorageType } from "../entities/StorageConfig";
import { StorageClientRepository } from "../repositories/StorageClientRepository";
/**
 * @description This file is refactored
 */
export class SetStorageClientUseCase {
    constructor(private storageClientRepository: StorageClientRepository) {}

    public execute(client: AppStorageType): FutureData<void> {
        return this.storageClientRepository.changeStorageClient(client);
    }
}
