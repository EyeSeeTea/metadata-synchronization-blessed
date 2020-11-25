import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage } from "../entities/Package";

export class DeletePackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<boolean> {
        try {
            const item = await this.repositoryFactory
                .storageRepository(instance)
                .getObjectInCollection<BasePackage>(Namespace.PACKAGES, id);

            if (!item) return false;

            await this.repositoryFactory
                .storageRepository(instance)
                .saveObjectInCollection(Namespace.PACKAGES, {
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
