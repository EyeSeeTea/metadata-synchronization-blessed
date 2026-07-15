import { UseCase } from "../../common/entities/UseCase";
import { UserRepository } from "../../user/repositories/UserRepository";
import { Instance } from "../entities/Instance";
import { InstanceRepository, InstancesFilter } from "../repositories/InstanceRepository";

export class ListInstancesUseCase implements UseCase {
    constructor(private userRepository: UserRepository, private instanceRepository: InstanceRepository) {}

    public async execute(filters: InstancesFilter = {}): Promise<Instance[]> {
        const user = await this.userRepository.getCurrent();
        const instances = await this.instanceRepository.getAll(filters);

        return instances.filter(instance => instance.hasPermissions("read", user) || instance.id === "LOCAL");
    }
}
