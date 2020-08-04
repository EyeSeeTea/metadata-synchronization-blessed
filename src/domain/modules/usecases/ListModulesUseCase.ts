import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { BaseModule, Module } from "../entities/Module";
import { MetadataModule } from "../entities/MetadataModule";

export class ListModulesUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(): Promise<Module[]> {
        const data = await this.storageRepository.listObjectsInCollection<BaseModule>(
            Namespace.MODULES
        );

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
