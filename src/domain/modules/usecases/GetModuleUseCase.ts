import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../../data/storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { MetadataModule } from "../entities/MetadataModule";
import { BaseModule, Module } from "../entities/Module";

export class GetModuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<Module | undefined> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const module = await storageRepository.getObjectInCollection<BaseModule>(
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
