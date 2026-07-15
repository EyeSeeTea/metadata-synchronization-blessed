import { Instance } from "../../../instance/entities/Instance";
import { WmrSettings } from "../entities/WmrSettings";

export interface WmrRepositoryConstructor {
    new (instance: Instance): WmrSettingsRepository;
}

export interface WmrSettingsRepository {
    get(): Promise<WmrSettings>;
}
