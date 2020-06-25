import { UseCase } from "../../common/entities/UseCase";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class GetInstanceVersionUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(): Promise<string> {
        return this.instanceRepository.getVersion();
    }
}
