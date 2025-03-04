import { StorageType } from "../entities/Config";
import { ConfigRepository } from "../repositories/ConfigRepository";

export class GetStorageConfigUseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<StorageType> {
        const client = await this.configRepository.getStorageClient();

        return client.type;
    }
}
