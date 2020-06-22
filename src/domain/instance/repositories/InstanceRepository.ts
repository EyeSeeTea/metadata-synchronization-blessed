import { Instance } from "../entities/Instance";
import { User } from "../entities/User";

export interface InstanceRepository {
    getUser(): Promise<User>;
    getVersion(): Promise<string>;
    getById(id: string): Promise<Instance>;
    getDefaultIds(filter?: string): Promise<string[]>;
}
