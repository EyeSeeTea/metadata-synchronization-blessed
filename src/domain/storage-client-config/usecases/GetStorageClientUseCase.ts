import { FutureData } from "../../common/entities/Future";
import { AppStorageType } from "../entities/StorageConfig";
import { StorageClientRepository } from "../repositories/StorageClientRepository";
/**
 * @description This file is refactored
 */
export class GetStorageClientUseCase {
    constructor(private storageClientRepository: StorageClientRepository) {}

    public execute(): FutureData<AppStorageType> {
        return this.storageClientRepository.getStorageClient().map(client => client.type);
    }
}
