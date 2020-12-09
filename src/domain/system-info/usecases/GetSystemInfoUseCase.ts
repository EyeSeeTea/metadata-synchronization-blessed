import { UseCase } from "../../common/entities/UseCase";
import { SystemInfo } from "../entities/SystemInfo";
import { SystemSettingsRepository } from "../repositories/SystemInfoRepository";

export class GetSystemInfoUseCase implements UseCase {
    constructor(private systemSettingsRepository: SystemSettingsRepository) {}

    public async execute(): Promise<SystemInfo> {
        return this.systemSettingsRepository.get();
    }
}
