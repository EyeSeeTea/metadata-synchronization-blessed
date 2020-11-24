import { Namespace } from "../../../data/storage/Namespaces";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage } from "../entities/Package";

export class DeletePackageUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(id: string, instance = this.localInstance): Promise<boolean> {
        try {
            const item = await this.storageRepository(instance).getObjectInCollection<BasePackage>(
                Namespace.PACKAGES,
                id
            );

            if (!item) return false;

            await this.storageRepository(instance).saveObjectInCollection(Namespace.PACKAGES, {
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
