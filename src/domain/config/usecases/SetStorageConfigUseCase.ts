import { StorageType } from "../entities/Config";
import { ConfigRepository } from "../repositories/ConfigRepository";

export class SetStorageConfigUseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(client: StorageType): Promise<void> {
        await this.configRepository.changeStorageClient(client);
    }
}
