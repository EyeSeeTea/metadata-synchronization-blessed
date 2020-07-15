import { SharingSetting } from "../../common/entities/SharingSetting";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataEntities } from "../entities/MetadataEntities";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class SetResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        id: string,
        entity: keyof MetadataEntities,
        userAccesses: SharingSetting[],
        userGroupAccesses: SharingSetting[],
        instance = this.localInstance
    ): Promise<void> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        await storageRepository.saveObjectInCollection<MetadataResponsible>(
            Namespace.RESPONSIBLES,
            { id, userAccesses, userGroupAccesses, entity }
        );
    }
}
