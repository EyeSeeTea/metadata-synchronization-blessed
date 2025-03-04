import { AppStorageType } from "../entities/StorageConfig";
import { StorageClientRepository } from "../repositories/StorageClientRepository";

export class SetStorageClientUseCase {
    constructor(private storageClientRepository: StorageClientRepository) {}

    public async execute(client: AppStorageType): Promise<void> {
        await this.storageClientRepository.changeStorageClient(client);
    }
}
