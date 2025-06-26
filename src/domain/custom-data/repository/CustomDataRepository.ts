import { CustomData } from "../entities/CustomData";

export interface CustomDataRepository {
    get<T extends CustomData>(customDataKey: string): Promise<T | undefined>;
    save<T extends CustomData>(customDataKey: string, data: T): Promise<void>;
}
