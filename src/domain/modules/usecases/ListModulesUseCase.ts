import { UseCase } from "../../common/entities/UseCase";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Module } from "../entities/Module";

export class ListModulesUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(): Promise<Module[]> {
        return await this.storageRepository.listObjectsInCollection<Module>("modules");
    }
}
