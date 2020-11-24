import { Namespace } from "../../../data/storage/Namespaces";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataModule } from "../entities/MetadataModule";
import { BaseModule, Module } from "../entities/Module";

export class GetModuleUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(id: string, instance = this.localInstance): Promise<Module | undefined> {
        const module = await this.storageRepository(instance).getObjectInCollection<BaseModule>(
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
