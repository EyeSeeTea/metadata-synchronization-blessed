import { UseCase } from "../../common/entities/UseCase";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class GetInstanceVersionUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(): Promise<string> {
        const buildVersion = await this.instanceRepository.getVersion();
        const [major, minor] = buildVersion.split(".");
        return `${major}.${minor}`;
    }
}
