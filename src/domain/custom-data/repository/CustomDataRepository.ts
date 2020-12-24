import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { CustomData } from "../entities/CustomData";

export interface CustomDataRepositoryConstructor {
    new (configRepository: ConfigRepository): CustomDataRepository;
}

export interface CustomDataRepository {
    get(customDataKey: string): Promise<CustomData | undefined>;
    save(customDataKey: string, data: CustomData): Promise<void>;
}
