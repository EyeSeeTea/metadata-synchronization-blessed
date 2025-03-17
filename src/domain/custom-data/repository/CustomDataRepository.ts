import { StorageClientFactory } from "../../../data/config/StorageClientFactory";
import { CustomData } from "../entities/CustomData";

export interface CustomDataRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory): CustomDataRepository;
}

export interface CustomDataRepository {
    get<T extends CustomData>(customDataKey: string): Promise<T | undefined>;
    save<T extends CustomData>(customDataKey: string, data: T): Promise<void>;
}
