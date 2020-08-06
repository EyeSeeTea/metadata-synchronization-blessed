import { cache } from "../../../utils/cache";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class SetResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(responsible: MetadataResponsible): Promise<void> {
        const { id, users, userGroups } = responsible;

        if (users.length === 0 && userGroups.length === 0) {
            await this.storageRepository.removeObjectInCollection(Namespace.RESPONSIBLES, id);
        } else {
            await this.storageRepository.saveObjectInCollection(
                Namespace.RESPONSIBLES,
                responsible
            );
        }
    }

    @cache()
    private get storageRepository() {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );
    }
}
