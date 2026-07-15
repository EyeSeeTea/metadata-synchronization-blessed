import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { Instance } from "../entities/Instance";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class GetInstanceByIdUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(id: string): Promise<Either<"NOT_FOUND", Instance>> {
        const instance = await this.instanceRepository.getById(id);

        if (!instance) return Either.error("NOT_FOUND");

        return Either.success(instance);
    }
}
