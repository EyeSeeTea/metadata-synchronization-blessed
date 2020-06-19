import { UseCase } from "../../common/entities/UseCase";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { BaseModule, Module } from "../entities/Module";
import { MetadataModule } from "../entities/modules/MetadataModule";

export class ListModulesUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(): Promise<Module[]> {
        const data = await this.storageRepository.listObjectsInCollection<BaseModule>("modules");

        return data.map(module => {
            switch (module.type) {
                case "metadata":
                    return MetadataModule.build(module);
                default:
                    throw new Error("Unknown module");
            }
        });
    }
}
