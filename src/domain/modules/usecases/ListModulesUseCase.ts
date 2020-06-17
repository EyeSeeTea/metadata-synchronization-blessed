import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Module } from "../entities/Module";

export class ListModulesUseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(): Promise<Module[]> {
        return await this.storageRepository.listObjectsInCollection<Module>("modules");
    }
}
