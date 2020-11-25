import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class GetResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        ids: string[],
        instance = this.localInstance
    ): Promise<MetadataResponsible[]> {
        const items = await this.repositoryFactory
            .storageRepository(instance)
            .listObjectsInCollection<MetadataResponsible>(Namespace.RESPONSIBLES);

        return items.filter(({ id }) => ids.includes(id));
    }
}
