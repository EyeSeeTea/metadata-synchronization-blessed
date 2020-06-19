import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Module } from "../entities/Module";

export class GetModuleUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<Module | undefined> {
        return this.storageRepository.getObjectInCollection<Module>(Namespace.MODULES, id);
    }
}
