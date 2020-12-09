import { Instance } from "../../instance/entities/Instance";
import { SystemInfo } from "../entities/SystemInfo";

export interface SystemSettingsRepositoryConstructor {
    new (instance: Instance): SystemSettingsRepository;
}

export interface SystemSettingsRepository {
    get(): Promise<SystemInfo>;
}
