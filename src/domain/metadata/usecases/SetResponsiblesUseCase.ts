import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class SetResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        responsible: MetadataResponsible,
        instance = this.localInstance
    ): Promise<void> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const { id, userAccesses, userGroupAccesses } = responsible;
        if (userAccesses.length === 0 && userGroupAccesses.length === 0) {
            await storageRepository.removeObjectInCollection(Namespace.RESPONSIBLES, id);
        } else {
            await storageRepository.saveObjectInCollection<MetadataResponsible>(
                Namespace.RESPONSIBLES,
                responsible
            );
        }
    }
}
