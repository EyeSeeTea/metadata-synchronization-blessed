import { Instance } from "../entities/Instance";
import { User } from "../entities/User";

export interface InstanceRepository {
    getBaseUrl(): string;
    getUser(): Promise<User>;
    getVersion(): Promise<string>;
    getById(id: string): Promise<Instance>;
    getDefaultIds(filter?: string): Promise<string[]>;
}
