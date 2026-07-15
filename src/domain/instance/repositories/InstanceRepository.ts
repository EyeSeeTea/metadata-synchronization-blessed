import { Instance, InstanceType } from "../entities/Instance";
import { InstanceMessage } from "../entities/Message";

export interface InstancesFilter {
    search?: string;
    ids?: string[];
    types?: InstanceType[];
}

export interface InstanceRepository {
    getAll(filter: InstancesFilter): Promise<Instance[]>;
    getById(id: string): Promise<Instance | undefined>;

    sendMessage(message: InstanceMessage): Promise<void>;
    save(instance: Instance): Promise<void>;
    delete(id: string): Promise<void>;
}
