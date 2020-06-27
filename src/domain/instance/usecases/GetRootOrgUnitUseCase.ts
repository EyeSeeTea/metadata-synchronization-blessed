import { UseCase } from "../../common/entities/UseCase";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class GetRootOrgUnitUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute() {
        return this.instanceRepository.getOrgUnitRoots();
    }
}
