import { Instance } from "../entities/Instance";

export interface InstanceRepository {
    getById(id: string): Promise<Instance>;
    getDefaultIds(filter?: string): Promise<string[]>;
}
