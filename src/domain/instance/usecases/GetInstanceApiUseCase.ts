import { D2Api } from "../../../types/d2-api";
import { UseCase } from "../../common/entities/UseCase";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class GetInstanceApiUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public execute(): D2Api {
        return this.instanceRepository.getApi();
    }
}
