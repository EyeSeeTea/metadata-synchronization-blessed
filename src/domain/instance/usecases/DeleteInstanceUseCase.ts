import { UseCase } from "../../common/entities/UseCase";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class DeleteInstanceUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(id: string): Promise<Boolean> {
        try {
            await this.instanceRepository.delete(id);
        } catch (error: any) {
            console.error(error);
            return false;
        }

        return true;
    }
}
