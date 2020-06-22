import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { InstanceRepository } from "../../instance/repositories/InstanceRepository";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Module } from "../entities/Module";

export class SaveModuleUseCase implements UseCase {
    constructor(
        private storageRepository: StorageRepository,
        private instanceRepository: InstanceRepository
    ) {}

    public async execute(module: Module): Promise<ValidationError[]> {
        const validations = module.validate();

        if (validations.length === 0) {
            const user = await this.instanceRepository.getUser();
            const newModule = module.update({
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: module.user.id ? module.user : user,
            });
            
            await this.storageRepository.saveObjectInCollection<Module>(
                Namespace.MODULES,
                newModule
            );
        }

        return validations;
    }
}
