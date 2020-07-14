import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataResponsible } from "../entities/MetadataResponsible";
import { NamedRef } from "../../common/entities/Ref";
import { MetadataEntities } from "../entities/MetadataEntities";

export class ListResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        id: string,
        entity: keyof MetadataEntities,
        user: NamedRef,
        instance = this.localInstance
    ): Promise<void> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        await storageRepository.saveObjectInCollection<MetadataResponsible>(
            Namespace.RESPONSIBLES,
            { id, user, entity }
        );
    }
}
