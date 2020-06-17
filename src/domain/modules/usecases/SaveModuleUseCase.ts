import { ValidationError } from "../../common/entities/Validations";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Module } from "../entities/Module";

export class SaveStoreUseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(module: Module): Promise<ValidationError[]> {
        const validations = module.validate();

        if (validations.length === 0) {
            await this.storageRepository.saveObjectInCollection<Module>(Namespace.MODULES, module);
        }

        return validations;
    }
}
