import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataModule } from "../entities/MetadataModule";
import { BaseModule, Module } from "../entities/Module";

export class ListModulesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance): Promise<Module[]> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const data = await storageRepository.listObjectsInCollection<BaseModule>(Namespace.MODULES);

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
