import { StorageClientRepository } from "../../storage-client-config/repositories/StorageClientRepository";
import { CustomData } from "../entities/CustomData";

export interface CustomDataRepositoryConstructor {
    new (configRepository: StorageClientRepository): CustomDataRepository;
}

export interface CustomDataRepository {
    get<T extends CustomData>(customDataKey: string): Promise<T | undefined>;
    save<T extends CustomData>(customDataKey: string, data: T): Promise<void>;
}
