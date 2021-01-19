import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { CustomData } from "../entities/CustomData";

export interface CustomDataRepositoryConstructor {
    new (configRepository: ConfigRepository): CustomDataRepository;
}

export interface CustomDataRepository {
    get<T extends CustomData>(customDataKey: string): Promise<T | undefined>;
    save<T extends CustomData>(customDataKey: string, data: T): Promise<void>;
}
