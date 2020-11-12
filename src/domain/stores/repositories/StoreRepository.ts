import { Store } from "../entities/Store";

export interface StoreRepository {
    list(): Promise<Store[]>;
    getById(id: string): Promise<Store>;
    delete(id: string): Promise<boolean>;
    save(store: Store): Promise<void>;
    getDefault(): Promise<Store>;
}
