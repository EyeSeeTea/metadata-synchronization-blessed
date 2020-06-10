import Instance from "../entities/Instance";

export default interface InstanceRepository {
    getById(id: string): Promise<Instance>;
    getDefaultIds(filter?: string): Promise<string[]>;
}
