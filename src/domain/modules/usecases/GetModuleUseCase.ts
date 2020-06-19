import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { BaseModule, Module } from "../entities/Module";
import { MetadataModule } from "../entities/modules/MetadataModule";

export class GetModuleUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<Module | undefined> {
        const module = await this.storageRepository.getObjectInCollection<BaseModule>(
            Namespace.MODULES,
            id
        );

        switch (module?.type) {
            case "metadata":
                return MetadataModule.build(module);
            default:
                return undefined;
        }
    }
}
