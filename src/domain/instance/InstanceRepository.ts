import Instance from "./Instance";

export default interface InstanceRepository {
    getById(id: string): Promise<Instance>;
}
