import { AppStorageType } from "../entities/StorageConfig";
import { StorageClientRepository } from "../repositories/StorageClientRepository";
/**
 * @description This file is refactored
 */
export class GetStorageClientUseCase {
    constructor(private storageClientRepository: StorageClientRepository) {}

    public async execute(): Promise<AppStorageType> {
        const client = await this.storageClientRepository.getStorageClient();
        return client.type;
    }
}
