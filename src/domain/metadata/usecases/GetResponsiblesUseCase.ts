import { Namespace } from "../../../data/storage/Namespaces";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class GetResponsiblesUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(
        ids: string[],
        instance = this.localInstance
    ): Promise<MetadataResponsible[]> {
        const items = await this.storageRepository(instance).listObjectsInCollection<
            MetadataResponsible
        >(Namespace.RESPONSIBLES);

        return items.filter(({ id }) => ids.includes(id));
    }
}
