import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class GetResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(ids: string[], instance = this.localInstance): Promise<MetadataResponsible[]> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

        const items = await storageClient.listObjectsInCollection<MetadataResponsible>(Namespace.RESPONSIBLES);

        return items.filter(({ id }) => ids.includes(id));
    }
}
