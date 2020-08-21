import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { BasePackage } from "../entities/Package";

export class DeletePackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<boolean> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        try {
            const item = await storageRepository.getObjectInCollection<BasePackage>(
                Namespace.PACKAGES,
                id
            );

            if (!item) return false;

            await storageRepository.saveObjectInCollection(Namespace.PACKAGES, {
                ...item,
                deleted: true,
                contents: {},
            });
        } catch (error) {
            return false;
        }

        return true;
    }
}
