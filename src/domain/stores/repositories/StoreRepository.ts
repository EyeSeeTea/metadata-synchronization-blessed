import { Instance } from "../../instance/entities/Instance";
import { Store } from "../entities/Store";

export interface StoreRepositoryConstructor {
    new (instance: Instance): StoreRepository;
}

export interface StoreRepository {
    list(): Promise<Store[]>;
    getById(id: string): Promise<Store | undefined>;
    delete(id: string): Promise<boolean>;
    save(store: Store): Promise<void>;
    getDefault(): Promise<Store | undefined>;
    setDefault(id: string): Promise<void>;
}
