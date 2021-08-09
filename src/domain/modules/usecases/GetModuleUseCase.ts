import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataModule } from "../entities/MetadataModule";
import { BaseModule, Module } from "../entities/Module";

export class GetModuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<Module | undefined> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClient();

        const module = await storageClient.getObjectInCollection<BaseModule>(Namespace.MODULES, id);

        switch (module?.type) {
            case "metadata":
                return MetadataModule.build(module);
            default:
                return undefined;
        }
    }
}
