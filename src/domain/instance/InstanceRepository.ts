import Instance from "./Instance";

export default interface InstanceRepository {
    getById(id: string): Promise<Instance>;
    getDefaultIds(filter?: string): Promise<string[]>;
}
